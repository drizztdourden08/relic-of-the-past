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

#include <emscripten.h>

#include "src/types.h"

#include "emscripten_internal.h"

bool g_vsync = false;
double g_frame_accumulator = 0.0;
double g_last_frame_time = 0.0;

// Never advance more than this per tick. A display slower than the game legitimately owes two steps,
// but a long stall (window hidden, load hitch) must not cash in as a burst of fast-forward.
#define MAX_STEPS_PER_TICK 2

// Swap schedules. Safe to call at any time, because the accumulator is rearmed so the first tick after a
// switch can't see a stale timestamp and claim a huge delta.
void SetVsyncMode(bool enable) {
  g_vsync = enable;
  g_frame_accumulator = 0.0;
  g_last_frame_time = 0.0;
  if (enable)
    emscripten_set_main_loop_timing(EM_TIMING_RAF, 1);
  else
    emscripten_set_main_loop_timing(EM_TIMING_SETTIMEOUT, (int)(1000 / 60));
}

// How many game steps this tick owes. Always 1 on the timer schedule, where the schedule is the
// clock. On the display schedule the elapsed time decides: usually 0 on a 144 Hz panel, 1 on 60 Hz,
// 2 on 30 Hz. Returning 0 means the tick draws nothing and the previous frame stays up.
int StepsOwedThisTick(void) {
  if (!g_vsync)
    return 1;

  double now = emscripten_get_now();
  if (g_last_frame_time == 0.0) {
    // First tick after start or a mode switch, so run one step and start measuring from here.
    g_last_frame_time = now;
    return 1;
  }

  g_frame_accumulator += now - g_last_frame_time;
  g_last_frame_time = now;

  // Drop anything owed past the catch-up ceiling, so a stall is absorbed instead of replayed.
  double ceiling = FRAME_INTERVAL_MS * MAX_STEPS_PER_TICK;
  if (g_frame_accumulator > ceiling)
    g_frame_accumulator = ceiling;

  int steps = 0;
  while (g_frame_accumulator >= FRAME_INTERVAL_MS && steps < MAX_STEPS_PER_TICK) {
    g_frame_accumulator -= FRAME_INTERVAL_MS;
    steps++;
  }
  return steps;
}
