/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"
#include "src/sprite.h"

// ─── The Opening Story's Sprites ───
//
// The story places its own sprites through SetOamPlain, which keeps a byte of X plus the 9th bit the
// caller hands it, and stores Y raw. On a 4:3 frame that byte pair is the whole coordinate. A sprite
// still above the picture wraps into 0xe0..0xff, which a 224-row screen never draws; one past the left
// edge wraps into the top of the 9-bit X, which is off a 256px screen either way. A wide or tall view
// draws both of those places, so the wrapped value lands inside the picture:
//
//   throne room   the shelves and the king are above the frame while the camera pans up to them, and
//                 drew in the bottom band instead, blinking in and out with every step of the pan
//   prison        the girl the guards escort left jumped to the far right of the view the moment her
//                 screen X went negative
//
// The scenes hold both coordinates in full before they truncate them, so the fix is to hand the same
// value over a second time in the form the wide and tall views read: the X bits above the 9th that
// g_oam_x_high carries, and the 9-bit Y of g_oam_y_high (sprite.h). attract_x_base and attract_y_base
// are themselves bytes, so the full origin cannot be recovered at the OAM write and the scene records it
// where it computes it. Each axis is only touched where the view actually draws past the 4:3 picture on
// it, so a plain 224-row frame keeps the byte SetOamPlain wrote, and with the gate down nothing here runs
// at all.

// Rows past the 4:3 picture are drawn in two shapes, and only one of them has a vertical budget. A tall
// profile draws a band on each side (g_oam_tall_budget). The 224-to-240 mode draws sixteen rows below the
// picture and none above, with that budget still zero: emscripten_main derives both the row count and the
// Height240 flag from g_config.extend_y alone, and ZeldaDrawPpuFrame rasterises 224 + 16 from the flag.
// Asking "is there a top budget" missed that second shape, so the wrapped byte still drew the throne
// room's king and its shelves down in those sixteen rows, cut off by row 240, at the moment the pan was
// about to bring them in at the top. OamSetY answers both: with a budget it writes the 9-bit form, and
// without one it keeps the vanilla 8-bit window, which hides a sprite more than 16px above the picture
// and leaves everything the extra rows really hold exactly where it was.
static bool RowsPastThePicture(void) {
  return Tall_Active() || g_config.extend_y;
}

static bool g_attract_origin_armed;
static int g_attract_origin_x, g_attract_origin_y;

void GameHook_AttractDrawOrigin(int x, int y) {
  if (!GameHook_AttractCorrections())
    return;
  g_attract_origin_armed = true;
  g_attract_origin_x = x;
  g_attract_origin_y = y;
}

void GameHook_AttractDrawEnd(void) {
  g_attract_origin_armed = false;
}

void GameHook_AttractOamEntry(OamEnt *oam, int dx, int dy) {
  if (!g_attract_origin_armed)
    return;
  const int slot = (int)(oam - oam_buf);
  if (Wide_Active()) {
    const int x = g_attract_origin_x + dx;
    OamSetX(oam, (uint16)x);
    bytewise_extended_oam[slot] = (uint8)((bytewise_extended_oam[slot] & ~1) | ((x >> 8) & 1));
  }
  if (RowsPastThePicture())
    OamSetY(oam, (uint16)(g_attract_origin_y + dy));
}

// The throne room hands a sprite over once it is within 32px of the picture's top edge, which on a 4:3
// frame is the last moment before any of it would show. A tall view draws the rows above that edge, so
// the same sprite has to be handed over that much further up again, or it appears from nothing part way
// down the band as the camera pans up to it.
#define ATTRACT_SPRITE_LEAD 32

bool GameHook_AttractSpriteEntersFromAbove(int y) {
  return GameHook_AttractCorrections() && y + ATTRACT_SPRITE_LEAD + g_render_extra_top >= 0;
}

// The prison stops drawing the escort on a countdown, and its threshold is the moment the trio has left
// a 256px picture. A wider one still shows where they are, so they vanished in clear view, a whole band
// short of the edge. |base| is the walk position the scene drives them from, and the leading guard's far
// side is this much to the right of it.
#define ATTRACT_ESCORT_EXTENT 48

bool GameHook_AttractEscortInView(int base) {
  return GameHook_AttractCorrections() && base + ATTRACT_ESCORT_EXTENT > -g_render_extra_left;
}
