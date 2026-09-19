/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── The Opening Story's View Budget ───
//
// Leaving the title screen alone plays the legend: the text over a scrolling backdrop, the world map,
// the throne room, the prison, and the wizard at the altar. All five fell in the fixed-frame arm of
// ConfigurePpuSideSpace, which hands out the build's whole sideways budget and no vertical one at all.
// A tall profile therefore drew plain black above and below every scene, and a very wide one drew a
// second copy of a room beside it.
//
// The five scenes are three different constructions, and the fade out of one still shows the scene
// before it, so the budget is measured from what the layers hold this frame instead of from the scene
// counter:
//
//   mode 7                     the world map
//   BG2 on a 32x32 tilemap     the legend's backdrop
//   BG2 on a 64x64 tilemap     one of the three rooms, or the title screen before the story starts
//
// Backdrop. Attract_BuildBackgrounds fills both layers from a four-entry row pattern repeated over one
// 32x32 screen, so the picture repeats every 32 pixels on BG1 and every 16 on BG2, and 256 divides
// both. The fetch wraps every 256 pixels onto the same pattern, so every side can take the whole
// budget and the backdrop carries on with no seam. The text and the picture above it sit on BG3, which
// the renderer already keeps out of the margins, so they hold the place the scene composed them in.
//
// Rooms. Dungeon_LoadAndDrawEntranceRoom draws a whole 512x512 room into both tilemaps and the scene
// parks the camera in one corner of it. Past the tilemap the fetch wraps and draws the room again, so
// each side gets the distance from the camera to the tilemap's own edge and no more. A side the camera
// already sits against gets nothing, which is the black margin indoor play shows at a room's edge.
// The camera comes from the layer the renderer fetches with, not from BG2HOFS_copy2: Attract_PrepFinish
// masks those copies into 0..511 once and the scenes then drive the registers on their own, so the copy
// stands still while the throne room pans and only the live register describes the picture.
//
// World map. Mode 7 builds its plane one line at a time from a 240-entry zoom table, and that table
// describes the picture's own lines. The rows below the picture keep the last line's projection and
// carry the plane on: the biggest step between two rows there measured at 0 to 13, inside the map's own
// texture (median 8 to 12). The rows above have no entry to draw with at all, and come out as whatever
// step the frame left the registers on: that boundary measured at 61 to 97, the single largest jump in
// the frame at every zoom. So the map takes the budget below the picture and nothing above it, and
// keeps the sideways budget it already had.

// attract_sequence for the first of the three room scenes. Below it the story is on the backdrop or the
// map, and at 0 with no backdrop built the title screen is what the frame still shows.
#define ATTRACT_SCENE_THRONE_ROOM 2

// A dungeon room: 64x64 tiles on both layers, and the fetch wraps onto itself past that.
#define ATTRACT_ROOM_SPAN 512
#define ATTRACT_PICTURE_W 256
#define ATTRACT_PICTURE_H 224

// Gated with the other corrections for a picture drawn assuming a 4:3 screen. Off, the caller's fixed
// frame is the whole behaviour, exactly as before.
static bool AttractViewGate(void) {
  return main_module_index == MODULE_ATTRACT
      && (enhanced_features0 & kFeatures0_WidescreenVisualFixes) != 0;
}

static void SetBudget(int *left, int *right, int *top, int *bottom, int sides, int up, int down) {
  *left = sides, *right = sides, *top = up, *bottom = down;
}

bool GameHook_AttractViewBudget(int *left, int *right, int *top, int *bottom) {
  if (!AttractViewGate())
    return false;
  const Ppu *ppu = g_zenv.ppu;
  if (ppu->mode == 7) {
    SetBudget(left, right, top, bottom, kPpuExtraLeftRight, 0, kPpuExtraTopBottom);
    return true;
  }
  const BgLayer *bg = &ppu->bgLayer[1];
  if (!bg->tilemapWider && !bg->tilemapHigher) {
    SetBudget(left, right, top, bottom, kPpuExtraLeftRight, kPpuExtraTopBottom, kPpuExtraTopBottom);
    return true;
  }
  if (attract_sequence < ATTRACT_SCENE_THRONE_ROOM)
    return false;
  int camX = bg->hScroll & (ATTRACT_ROOM_SPAN - 1);
  int camY = bg->vScroll & (ATTRACT_ROOM_SPAN - 1);
  *left = camX;
  *right = IntMax(0, ATTRACT_ROOM_SPAN - ATTRACT_PICTURE_W - camX);
  *top = camY;
  *bottom = IntMax(0, ATTRACT_ROOM_SPAN - ATTRACT_PICTURE_H - camY);
  return true;
}
