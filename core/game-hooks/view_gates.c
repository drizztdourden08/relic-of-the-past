/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Light-Cone Extra-Width Gate ───
//
// A dark room lit by the lamp draws its darkness with color math: the room is on the main
// screen, an opaque mask sits on BG1 on the subscreen, and the fixed color is subtracted
// everywhere the mask leaves transparent. The mask is a 256-wide construct on a tilemap that
// wraps every 512 pixels, so it only ever covers the base 4:3 frame. Widen the view and the
// margins sample the wrapped tilemap instead: a second, undarkened copy of the lit cone appears
// at the far left (and past the right edge). ConfigurePpuSideSpace therefore keeps the extra
// width at zero for as long as that mask is on screen.
//
// `hdr_dungeon_dark_with_lantern && TS_copy` describes the mask exactly while the player has
// control, and nothing else here changes that. It is wrong during a room transition: Module07_02
// clears the flag at subsubmodule 1 (Module07_02_01_LoadNextRoom) while the mask itself stays on
// BG1 untouched until subsubmodule 3 turns the subscreen off, so the fade-out frames in between
// re-open the margins under a mask that is still being drawn, which is the reported leak. The flag comes
// back only at subsubmodule 12, once the destination room is up.
//
// Instead of restating when the game does and doesn't clear the flag, latch the answer from the
// last frame the player had control and hold it for the transition: a transition that began under
// the mask stays collapsed until the next room settles, whatever the flag does in between.
static bool s_cone_held;

bool GameHook_LightConeSuppressesExtraWidth(void) {
  const bool live = hdr_dungeon_dark_with_lantern != 0 && TS_copy != 0;
  // Only the indoor module's own sub-states are a transition. main_module_index (not the
  // menu-remapped module the caller works with) is deliberate: the pause menu freezes the room
  // behind it with the mask exactly as it was, so it must read as settled, not as in flight.
  const bool in_transition = main_module_index == MODULE_DUNGEON && submodule_index != 0;
  if (live || !in_transition) {
    s_cone_held = live;
    return live;
  }
  // Held only for the wide view, the one thing that can expose the wrapped mask. Without it this
  // is the plain live test, so a 4:3 (or vertical-only) configuration behaves exactly as before.
  return Wide_Active() && s_cone_held;
}
