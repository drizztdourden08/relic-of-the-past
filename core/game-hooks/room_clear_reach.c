/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Which enemies keep a room from reading as clear ───
//
// Shutter doors that open on a cleared room, chests that appear on one, and a boss's closing
// sequence all ask the same question: is any enemy left on the screen? The original game counts
// an enemy when it stands inside the 256x256 square at the camera. With the widescreen play area
// on, that square grows sideways by the side budget so an enemy in plain sight on a wide picture
// still counts.
//
// Indoors the picture stops at the edge of the room section the camera is confined to. A
// one-screen section shows no extra columns at all, and the space past its wall belongs to the
// next section of the same room. The grown square still reached a full budget past that wall, so
// a soldier standing in the next section kept the doors of this one shut after every enemy in
// sight was dead. Whether it happened depended on where the neighbour's enemies stood.
//
// Indoors the square now grows only by the columns of this section the view can show: the
// distance from the camera to the section's own scroll limits, capped by the side budget. This
// is the same measure ConfigurePpuSideSpace hands the renderer, read from the room's bounds so
// the answer never depends on a frame having been drawn. The overworld keeps the full budget,
// since an area has no walled sections. Rows are untouched: the original 256 applies.
//
// Reached only from the widescreen play area branch, so with that setting off, or with no wide
// view configured, the original test runs unchanged.
enum { kClearSquare = 256 };

static void ShownSectionReach(int *left, int *right) {
  int q = quadrant_fullsize_x >> 1;
  int budget = (int)g_oam_wide_budget;
  *left = IntMin(budget, IntMax((int)BG2HOFS_copy2 - (int)room_bounds_x.v[q], 0));
  *right = IntMin(budget, IntMax((int)room_bounds_x.v[q + 2] - (int)BG2HOFS_copy2, 0));
}

bool GameHook_EnemyCountsTowardClear(int x, int y) {
  int left = WideLeftPx(), right = WideRightPx();
  if (player_is_indoors)
    ShownSectionReach(&left, &right);
  return x >= -left && x < kClearSquare + right && y >= 0 && y < kClearSquare;
}
