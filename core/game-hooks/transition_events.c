/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Transition Settled Events ───
//
// Publishes the one frame the game itself considers a transition finished: the frame
// main_module_index enters a gameplay module (7 = dungeon, 9 = overworld), or the frame
// submodule_index returns to 0 inside one. That covers every room transition, door
// animation, shutter close, stair climb and scroll by construction, since the module's own
// dispatch loop treats submodule 0 as "player has control" (Dungeon_HandleRoomTags and
// friends only run then). Classification of which kind of transition this was happens in
// JS (classify-transition.ts), not here; this file only detects the edge and reports raw
// numbers.

static bool IsGameplayModule(uint8 m) { return m == 7 || m == 9; }

static uint8 s_prev_module = 0xFF;
static uint8 s_prev_submodule = 0;

void GameHook_ModuleFrameEnd(void) {
  const uint8 mod = main_module_index;
  const uint8 sub = submodule_index;
  const uint8 prev_module = s_prev_module;
  const uint8 prev_submodule = s_prev_submodule;
  // Track every frame regardless of the gate below, so the first frame after dev tools gets turned
  // back on compares against last frame's module/submodule instead of whatever was current the last
  // time the gate happened to be open. Without that, the comparison can span an arbitrary gap and emit
  // a spurious "entered" event for a transition that never actually happened.
  s_prev_module = mod;
  s_prev_submodule = sub;

  // Off by default: makes zero host-calls, same contract as haptics.
  if (!(enhanced_features0 & kFeatures0_DeveloperTools))
    return;

  const bool entered = IsGameplayModule(mod) && !IsGameplayModule(prev_module);
  const bool settled = IsGameplayModule(mod) && prev_submodule != 0 && sub == 0;

  if (entered || settled) {
    EM_ASM({
      if (typeof window !== 'undefined' && window.__onTransitionSettled) {
        window.__onTransitionSettled($0, $1, $2, $3, $4);
      }
    }, mod, entered ? 0 : prev_submodule,
       player_is_indoors ? 1 : 0, dungeon_room_index, overworld_screen_index);
  }
}
