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

// ─── Pit-Fall Transition View Gate ───
//
// A hole in the overworld hands the crossing to its own module, which runs from the palette bounce over
// the departure screen to the landing in the room below. ConfigurePpuSideSpace describes the outdoor
// module and the indoor one and nothing else, so every frame of that crossing fell through to a zero
// budget: the picture snapped in to 4:3 for about two seconds and back out on arrival, even though each
// of those frames shows a scene one of the two branches already knows how to measure.
//
// player_is_indoors splits the crossing exactly where the picture changes. Dungeon_LoadEntrance sets it
// inside the force-blank frame that swaps the overworld for the room, so a frame before it still shows
// the departure area (camera and scroll bounds untouched, submodule 0, the same stationary case as the
// last frame of play) and a frame after it already shows the destination room with its bounds loaded.
// Reporting the module that owns the visible scene is all this does; the crossing's own logic, the
// camera and the fade are untouched.
//
// A wallmaster sending the player back to the last entrance reuses the same module from indoors, where
// player_is_indoors is already set, so that crossing reads as the room it is throughout.
//
// Gated with the area-seam pan, not on a switch of its own: both are the same promise, that a crossing
// keeps the view the play on either side of it had, so a player who wants one wants the other.
int GameHook_PitFallViewModule(int effectiveModule) {
  if (effectiveModule != MODULE_PIT_FALL_ENTRANCE || !(enhanced_features0 & kFeatures0_SmoothTransitions))
    return effectiveModule;
  return player_is_indoors ? MODULE_DUNGEON : MODULE_OVERWORLD;
}

// ─── Game-Over View Gate ───
//
// Dying hands the frame to the game-over module, and ConfigurePpuSideSpace describes the outdoor
// module and the indoor one and nothing else, so the whole sequence fell through to a zero budget: the
// picture snapped in to 4:3 when the player fell and stayed there through the red fill, the GAME OVER
// letters and the save menu, then snapped back out on the next room.
//
// The module runs in two kinds of frame. While the player spins down, and again once the revival fairy
// has lifted them and the colours come back, it shows the play it interrupted, with the camera, the
// scroll bounds and the loaded map all untouched. Those frames are described by the module the player
// died in, held the way a stationary frame of that module is, so the view keeps its width and the camera
// lock keeps its offset.
//
// From the iris closing until the fairy has finished lifting the player it draws over the whole screen
// instead: the iris, then a flat colour fill with the letters and the menu, or the fairy. Those frames take
// the full budget on every side so the fill reaches the edges. The scene and the player keep the camera
// lock's offset throughout, and the iris is widened and moved with it (iris_wide.c). The letters and the
// menu cursor are the exception: they are placed for the base frame beside menu text on a layer the lock
// never moves, so they keep their place. The game writes them to fixed OAM slots, the letters from the
// start of the buffer and the cursor to slot 20, and those are the slots marked.
//
// The special switch areas report themselves through saved_module_for_menu, which the game sets to the
// interrupted module on the way in; their scroll bounds are their own and the outdoor branch has to be
// told. Anywhere else player_is_indoors picks the side, as it does for the pit fall.
//
// Gated with the other corrections for a picture drawn assuming a 4:3 screen.
static bool GameOverViewGate(void) {
  return main_module_index == MODULE_GAME_OVER && (enhanced_features0 & kFeatures0_WidescreenVisualFixes);
}

int GameHook_GameOverViewModule(int effectiveModule) {
  if (effectiveModule != MODULE_GAME_OVER || !GameOverViewGate())
    return effectiveModule;
  if (saved_module_for_menu == MODULE_OVERWORLD_SPECIAL_AREA)
    return MODULE_OVERWORLD_SPECIAL_AREA;
  return player_is_indoors ? MODULE_DUNGEON : MODULE_OVERWORLD;
}

bool GameHook_LockFixedSlots(uint8 *fixed) {
  if (!GameOverViewGate() || submodule_index < GAME_OVER_SUB_LETTERS || submodule_index > GAME_OVER_SUB_SAVE_MENU)
    return false;
  memset(fixed, 0, 128);
  memset(fixed, 1, GAME_OVER_LETTER_SLOTS);
  fixed[GAME_OVER_CURSOR_SLOT] = 1;
  return true;
}

bool GameHook_GameOverCoversScreen(void) {
  if (!GameOverViewGate() || submodule_index < GAME_OVER_SUB_IRIS_WIPE || submodule_index > GAME_OVER_SUB_FAIRY_RISE)
    return false;
  // A dark room keeps the lamp's cone mask on the subscreen until the iris has closed, and the mask only
  // covers the base frame (see the light-cone gate above). Those frames stay at the base width, whose
  // margins were already black in a dark room; the fill widens once the game turns the subscreen off.
  return !(hdr_dungeon_dark_with_lantern && TS_copy);
}
