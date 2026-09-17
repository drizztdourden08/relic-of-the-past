/* @layer core-wasm-build @kind native */
// Frame pacing for the WASM build, covering how the main loop is scheduled and, when it is driven
// by the display, how many game steps a given tick actually owes. Split out of emscripten_main.c;
// the loop body itself stays there and just asks StepsOwedThisTick() what to do.
//
// Two schedules exist:
//   timer:   Emscripten drives the loop from setTimeout at a fixed ~60 Hz. This is what the build
//            has always done. It free-runs against the display's own clock, so on a 60 Hz panel the
//            two beat and a frame is periodically shown twice or dropped; in smooth scrolling that
//            reads as a stutter. High-refresh and variable-refresh displays mostly hide it, which
//            is why it goes unnoticed on some machines and not others.
//   vsync:   the loop is driven by the display's vertical blank instead. Presentation lines up with
//            the panel, but the tick rate is now whatever the panel runs at, so the accumulator
//            below is what keeps the game itself at the right speed.
//
// Turbo scales the game time either schedule owes. The upstream desktop build ran the game
// 16 frames per drawn frame while its turbo key was held, capped by nothing but the CPU. Here
// the multiplier is a configured value (125% to 1000%) and the extra steps are simulated but
// never drawn, so the display keeps its own cadence and the game just covers more of its time
// per tick. With the factor at 1 every path below is the pre-turbo code.

#include <emscripten.h>

#include "src/types.h"

#include "emscripten_internal.h"

bool g_vsync = false;
double g_frame_accumulator = 0.0;
double g_last_frame_time = 0.0;

// The configured speed as a percent of real time (100 = off) and whether the turbo key is held
// right now. Both are host state: the game core never reads them, so they belong in no gate
// word and cost no save-state bytes.
static int g_turbo_percent = 100;
static bool g_turbo_held = false;
// Fractional steps carried over between ticks on the timer schedule, where a 125% factor owes
// one step on three ticks and two on the fourth.
static double g_turbo_step_carry = 0.0;

// Never advance more than this per tick at real-time speed. A display slower than the game
// legitimately owes two steps, but a long stall (window hidden, load hitch) must not cash in as
// a burst of fast-forward. Turbo scales the ceiling with its factor, so a 10x hold on a 60 Hz
// panel still gets its ten steps.
#define MAX_STEPS_PER_TICK 2

#define TURBO_MIN_PERCENT 100
#define TURBO_MAX_PERCENT 1000

void SetTurboSpeed(int percent) {
  if (percent < TURBO_MIN_PERCENT)
    percent = TURBO_MIN_PERCENT;
  if (percent > TURBO_MAX_PERCENT)
    percent = TURBO_MAX_PERCENT;
  g_turbo_percent = percent;
}

void SetTurboHeld(bool held) {
  g_turbo_held = held;
  // A release drops any fraction still owed, so the first real-time tick after a hold is exact.
  if (!held)
    g_turbo_step_carry = 0.0;
}

// Effective speed multiplier: 1.0 unless turbo is both configured above 100% and held.
double TurboFactor(void) {
  return (g_turbo_held && g_turbo_percent > 100) ? g_turbo_percent / 100.0 : 1.0;
}

// Swap schedules. Safe to call at any time, because the accumulator is rearmed so the first tick after a
// switch can't see a stale timestamp and claim a huge delta.
void SetVsyncMode(bool enable) {
  g_vsync = enable;
  g_frame_accumulator = 0.0;
  g_last_frame_time = 0.0;
  g_turbo_step_carry = 0.0;
  if (enable)
    emscripten_set_main_loop_timing(EM_TIMING_RAF, 1);
  else
    emscripten_set_main_loop_timing(EM_TIMING_SETTIMEOUT, (int)(1000 / 60));
}

// Timer schedule: the schedule itself is the clock, so one tick owes exactly |factor| steps.
// The fractional part rides over to the next tick.
static int TimerStepsOwed(double factor) {
  if (factor == 1.0)
    return 1;
  g_turbo_step_carry += factor;
  int steps = (int)g_turbo_step_carry;
  g_turbo_step_carry -= steps;
  return steps;
}

// How many game steps this tick owes. On the timer schedule that is 1, or the turbo factor while
// the shortcut is held. On the display schedule the elapsed time decides: usually 0 on a 144 Hz panel,
// 1 on 60 Hz, 2 on 30 Hz, and turbo scales the elapsed time before it is banked. Returning 0
// means the tick draws nothing and the previous frame stays up.
int StepsOwedThisTick(void) {
  double factor = TurboFactor();
  if (!g_vsync)
    return TimerStepsOwed(factor);

  double now = emscripten_get_now();
  if (g_last_frame_time == 0.0) {
    // First tick after start or a mode switch, so run one step and start measuring from here.
    g_last_frame_time = now;
    return 1;
  }

  g_frame_accumulator += (now - g_last_frame_time) * factor;
  g_last_frame_time = now;

  // Drop anything owed past the catch-up ceiling, so a stall is absorbed instead of replayed.
  int max_steps = (int)(MAX_STEPS_PER_TICK * factor + 0.999);
  double ceiling = FRAME_INTERVAL_MS * max_steps;
  if (g_frame_accumulator > ceiling)
    g_frame_accumulator = ceiling;

  int steps = 0;
  while (g_frame_accumulator >= FRAME_INTERVAL_MS && steps < max_steps) {
    g_frame_accumulator -= FRAME_INTERVAL_MS;
    steps++;
  }
  return steps;
}
