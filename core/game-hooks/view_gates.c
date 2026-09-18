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

// ─── The File Screen's Own Sub-Screens ───
//
// Copying a file, erasing one and naming one are three modules of their own, and all three draw the file
// screen's art, which the module before them already gets the full frame for. So choosing Copy pulled the
// picture in and coming back pushed it out again, on a screen that never moves.
bool GameHook_FileScreenIsWide(int effectiveModule) {
  if (effectiveModule != MODULE_FILE_COPY && effectiveModule != MODULE_FILE_ERASE
      && effectiveModule != MODULE_FILE_NAME)
    return false;
  return (enhanced_features0 & kFeatures0_WidescreenVisualFixes) != 0;
}

// ─── Scenes Drawn Over The Play They Interrupted ───
//
// Finishing a dungeon, saving and quitting, the warp out of the tower, the bat smashing the pyramid and the
// walk to the triforce each hand the frame to a module of their own that draws no scene of its own: the
// room or the overworld stays where it was, the player stands in it, and the module runs a prize, a heal, a
// fade or a cutscene over the top. None of them were described, so the picture lost its margins for seconds
// at a time and snapped back when play resumed.
//
// Each is read as the scene underneath, the same way the game-over sequence is. The camera, the scroll
// bounds and the loaded map are untouched throughout, so the ordinary branch measures them correctly.
static bool InterruptedSceneGate(void) {
  return (enhanced_features0 & kFeatures0_WidescreenVisualFixes)
      && !(hdr_dungeon_dark_with_lantern && TS_copy);
}

int GameHook_InterruptedSceneModule(int effectiveModule) {
  if (!InterruptedSceneGate())
    return effectiveModule;
  // The triforce room is a special area, not a room or an overworld screen, so it is handed to the module
  // that already knows those: if the latch there does not recognise the location, the caller falls through
  // to no budget exactly as it does today.
  if (effectiveModule == MODULE_TRIFORCE_SCENE)
    return MODULE_OVERWORLD_SPECIAL_AREA;
  if (effectiveModule != MODULE_BOSS_VICTORY_PENDANT && effectiveModule != MODULE_BOSS_VICTORY_CRYSTAL
      && effectiveModule != MODULE_SAVE_AND_QUIT && effectiveModule != MODULE_MIRROR_WARP
      && effectiveModule != MODULE_GANON_EMERGES)
    return effectiveModule;
  return player_is_indoors ? MODULE_DUNGEON : MODULE_OVERWORLD;
}

bool GameHook_InterruptedSceneCoversScreen(void) {
  return InterruptedSceneGate()
      && (main_module_index == MODULE_BOSS_VICTORY_PENDANT
          || main_module_index == MODULE_BOSS_VICTORY_CRYSTAL
          || main_module_index == MODULE_SAVE_AND_QUIT
          || main_module_index == MODULE_MIRROR_WARP
          || main_module_index == MODULE_GANON_EMERGES
          || main_module_index == MODULE_TRIFORCE_SCENE);
}

// ─── Spotlight Transition View Gate ───
//
// Walking into a cave, a house or a dungeon, and walking back out, hands the frame to a module of its own
// while a circle closes on the player and opens again on the other side. Both draw the scene they
// interrupted: the same room or overworld, the same sprites, the player still walking. ConfigurePpuSideSpace
// knew neither, so the picture lost its margins for the whole crossing and got them back on arrival, twice
// per building, which is the most frequent transition in the game.
//
// player_is_indoors picks the side, the same way it does for a fall through a hole: the flag flips inside
// the force-blank frame that swaps one scene for the other, so a frame before it still shows the departure
// scene and a frame after it already shows the destination.
//
// A dark room lit by the lamp is the exception, as everywhere else: its cone mask only covers the base
// frame, so those crossings stay at the base width instead of showing the mask's wrapped copy.
static bool SpotlightViewGate(void) {
  return (main_module_index == MODULE_SPOTLIGHT_CLOSE || main_module_index == MODULE_SPOTLIGHT_OPEN)
      && (enhanced_features0 & kFeatures0_WidescreenVisualFixes)
      && !(hdr_dungeon_dark_with_lantern && TS_copy);
}

int GameHook_SpotlightViewModule(int effectiveModule) {
  if (!SpotlightViewGate()
      || (effectiveModule != MODULE_SPOTLIGHT_CLOSE && effectiveModule != MODULE_SPOTLIGHT_OPEN))
    return effectiveModule;
  return player_is_indoors ? MODULE_DUNGEON : MODULE_OVERWORLD;
}

bool GameHook_SpotlightCoversScreen(void) {
  return SpotlightViewGate();
}

// ─── Scanline Effects In A Tall View ───
//
// An effect built one scanline at a time (the iris, the swamp water's window, the mirror warp's wave, the
// credits bands) reaches the renderer through a 240-entry table, one entry per line of the original screen,
// which HDMA hands over as each line is drawn. The draw loop walks the physical buffer instead, and a tall
// view puts the top budget's worth of rows in front of the picture, so entry 0 landed on the first buffer
// row and every effect drew that many rows above where it belongs. The file-select split in the same loop
// is already shifted by the budget; these transfers were not.
//
// Holding the transfers back until the picture starts puts entry 0 on content row 0, which is what the
// table describes. The rows above the picture keep the registers the frame set up, as they did before.
//
// With the gate off, and on any view with no rows above the picture, the transfers run on every line
// exactly as they always have.
bool GameHook_HdmaWaitsForPicture(void) {
  return (enhanced_features0 & kFeatures0_WidescreenVisualFixes) && g_zenv.ppu->extraTopBottom != 0;
}
