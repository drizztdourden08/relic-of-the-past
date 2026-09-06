/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"
#include "src/sprite.h"

// ─── Running Man Widescreen Overrun ───
// Vanilla's flee script (Sprite_RunningMan, sprite_main.c) has two problems on a wide view, both
// only visible once the render area exceeds the stock 256px screen:
//
// 1. The scripted right-side path (right, down, right) is a fixed handful of frames tuned to end
//    just past a 256px screen, so GameHook_RunningManExtendRun keeps it going instead of handing him
//    back to idle partway across a wider view.
// 2. Sprite_PrepOamCoordOrDoubleRet's screen-relative active window (sprite.c) pauses, and can
//    kill, a sprite once it's far enough from LINK's on-screen position. That check exists to stop
//    simulating sprites the stock 256px screen would never have shown. On a wide view that window
//    is still much narrower than the visible area, so if Link doesn't follow him he freezes mid-
//    view. GameHook_RunningManStayActive neutralizes both effects while he's actively fleeing.
//
// With both handled, GameHook_RunningManOverrun accelerates him over time and ends the flee at a
// fixed world-distance cap or the instant he hits something solid (wallcoll), by returning
// him to the idle state, never Sprite_KillSelf, which clears his position's "loaded" bit and
// makes the overworld's own sprite-activation scan spawn a fresh copy back at his start position
// the moment that (now-visible-in-wide-view) position re-enters the activation rect.
//
// No-op in 4:3 or with extended rendering off, so vanilla behavior is untouched byte-for-byte.

enum {
  kRunningManAccelInterval = 8,   // frames between each acceleration step
  kRunningManAccelStepsMax = 32,  // caps the speed multiplier at (16+32)/16 = 3x
  kRunningManMaxRunFrames  = 600, // hard distance cap (~10s @ 60fps), clears any supported aspect ratio
};

static uint16 s_runFrames[16];  // per sprite-slot; mirrors g_sprite_in_band's sizing

void GameHook_RunningManStayActive(int k) {
  if (!Wide_Active()) return;
  if (sprite_ai_state[k] != 1 && sprite_ai_state[k] != 2) return;  // only while actively fleeing
  sprite_pause[k] = 0;          // don't let the screen-relative window freeze him mid-flee
  sprite_defl_bits[k] |= 0x80;  // and don't let it auto-kill him either, since we decide when he's done
}

bool GameHook_RunningManExtendRun(int k) {
  if (!Wide_Active()) return false;  // vanilla: let the scripted right-side path end normally
  sprite_A[k] = 255;  // re-arm the per-leg timer; sprite_B/head_dir are left untouched by the caller
  return true;
}

void GameHook_RunningManOverrun(int k, bool running) {
  if (!Wide_Active() || !running) {
    s_runFrames[k] = 0;  // vanilla path, or the pre-run reaction hop: nothing to accelerate yet
    return;
  }
  int frames = ++s_runFrames[k];
  int accel = clampi(frames / kRunningManAccelInterval, 0, kRunningManAccelStepsMax);
  sprite_x_vel[k] = (int8)((int8)sprite_x_vel[k] * (16 + accel) / 16);
  sprite_y_vel[k] = (int8)((int8)sprite_y_vel[k] * (16 + accel) / 16);

  if (frames >= kRunningManMaxRunFrames || sprite_wallcoll[k]) {
    // Distance cap reached, or ran into the fence/forest: stop like vanilla's own script does
    // (back to idle in place), not a kill, because killing would respawn a fresh copy at his start spot.
    sprite_ai_state[k] = 0;
    s_runFrames[k] = 0;
  }
}
