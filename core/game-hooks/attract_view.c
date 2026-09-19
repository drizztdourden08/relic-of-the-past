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
// Rooms. Dungeon_LoadAndDrawEntranceRoom opens an entrance, and the entrance record carries the camera's
// scroll bounds for the room behind it: room_bounds_x and room_bounds_y, a pair per axis picked by
// quadrant_fullsize, which is the read the indoor arm of ConfigurePpuSideSpace already makes. That pair
// is the room the scene was composed in. The 512x512 tilemap is not: it holds whatever the room map put
// beside the room, and measuring to its edge showed that. The altar's map carries a second chamber to its
// right and a third below it, the prison's one below, and both were on screen at 384 wide and 112 tall.
// A side the camera already sits against gets nothing, which is the black margin indoor play shows at a
// room's edge. The bounds are absolute room-map coordinates and the scroll register carries the low 9
// bits of the same number, so the two are compared on those bits alone: a room is 512 on a side, so its
// bounds never straddle that wrap. The camera comes from the layer the renderer fetches with, not from
// BG2HOFS_copy2: Attract_PrepFinish masks those copies into 0..511 once and the scenes then drive the
// registers on their own, so the copy stands still while the throne room pans and only the live register
// describes the picture.
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

// A dungeon room is 512 on a side, and both the tilemap fetch and the scroll registers wrap on that.
#define ATTRACT_ROOM_MASK 0x1ff

// Gated with the other corrections for a picture drawn assuming a 4:3 screen. Off, the caller's fixed
// frame is the whole behaviour, exactly as before.
bool GameHook_AttractCorrections(void) {
  return main_module_index == MODULE_ATTRACT
      && (enhanced_features0 & kFeatures0_WidescreenVisualFixes) != 0;
}

static void SetBudget(int *left, int *right, int *top, int *bottom, int sides, int up, int down) {
  *left = sides, *right = sides, *top = up, *bottom = down;
}

// A scroll bound, in the same low 9 bits the registers carry.
static int RoomBound(uint16 v) {
  return v & ATTRACT_ROOM_MASK;
}

static bool AttractRoomBudget(const BgLayer *bg, int *left, int *right, int *top, int *bottom) {
  if (attract_sequence < ATTRACT_SCENE_THRONE_ROOM)
    return false;
  const int qx = quadrant_fullsize_x >> 1, qy = quadrant_fullsize_y >> 1;
  const int camX = bg->hScroll & ATTRACT_ROOM_MASK, camY = bg->vScroll & ATTRACT_ROOM_MASK;
  *left = IntMax(0, camX - RoomBound(room_bounds_x.v[qx]));
  *right = IntMax(0, RoomBound(room_bounds_x.v[qx + 2]) - camX);
  *top = IntMax(0, camY - RoomBound(room_bounds_y.v[qy]));
  *bottom = IntMax(0, RoomBound(room_bounds_y.v[qy + 2]) - camY);
  return true;
}

bool GameHook_AttractViewBudget(int *left, int *right, int *top, int *bottom) {
  if (!GameHook_AttractCorrections())
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
  return AttractRoomBudget(bg, left, right, top, bottom);
}

// True while the story's module is up but its own first picture is not. The attract takes over several
// frames before it erases the tilemaps, so the frame still shows the title screen it was entered from, on
// that screen's own 64x64 map. Module 0 had the space around that picture carrying the screen's own
// background (fixed_picture_edges.c), and the module index alone dropped it the instant the story began,
// which put a second and a third copy of the title out at the far sides for those frames.
bool GameHook_AttractStillOnTitle(void) {
  if (!GameHook_AttractCorrections())
    return false;
  const Ppu *ppu = g_zenv.ppu;
  const BgLayer *bg = &ppu->bgLayer[1];
  return ppu->mode != 7 && (bg->tilemapWider || bg->tilemapHigher)
      && attract_sequence < ATTRACT_SCENE_THRONE_ROOM;
}

// The legend's backdrop darkens everything outside its box with colour maths, masked by a window the
// scene drives one line at a time. Opening that window across the rows above the picture leaves them
// undarkened, which reads as a bright band over a dark scene. The rows above take the picture's first
// line instead. The map and the rooms drive no window, so they keep the open pair.
bool GameHook_HdmaBandHoldsFirstLine(void) {
  if (!GameHook_AttractCorrections())
    return false;
  const Ppu *ppu = g_zenv.ppu;
  const BgLayer *bg = &ppu->bgLayer[1];
  return ppu->mode != 7 && !bg->tilemapWider && !bg->tilemapHigher;
}
