/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── World Fetch Scroll Carry ───
//
// The scroll registers keep ten bits, so a BG2 scroll value names a place inside one 1024 px block of
// the map and says nothing of which block. The linear world fetch recovers the block from the game
// camera once per frame (worldOffX / worldOffY, zelda_rtl.c), which holds as long as every scroll value
// written during the frame sits in the camera's own block.
//
// A per-scanline effect can break that. The mirror warp writes camera + wave to BG2HOFS on every other
// line, with the wave swinging 9 px either way. With the camera within 9 px of a block boundary (an
// area whose left edge is at x = 1024, the camera resting on that edge), the lines that swing below the
// boundary wrap to 1015..1023 in the register, the fetch reads them one block too far right, finds no
// map there and draws the backdrop: every other line of the picture turns into a flat stripe. The
// screen shake adds to the register the same way.
//
// The stock 512 px fetch wraps, so it never needed the block. Here the register value is read as the
// place nearest the camera, and the offset gets the whole blocks between that place and the camera's
// block for the line about to be drawn.

enum { kScrollBlock = 1024, kScrollMask = kScrollBlock - 1 };

static int s_carry_x, s_carry_y;

// Whole blocks to add to |scroll| so it lands on the place nearest |camera|: 0, 1024 or -1024.
static int ScrollCarry(int scroll, int camera) {
  int low = camera & kScrollMask;
  int ahead = (scroll - low) & kScrollMask;  // how far the register sits past the camera, wrapped
  int offset = ahead < kScrollBlock / 2 ? ahead : ahead - kScrollBlock;
  return low + offset - scroll;
}

// Called by the draw loop once a line's scanline transfers are done, so the registers hold what the
// next line draws with. |frameDone| takes the carry back out after the last line, which leaves the
// offsets as the frame's own build left them. With the gate off, or with the stock fetch in use, the
// carry stays zero and the offsets are never touched.
void GameHook_WorldFetchFollowsScroll(bool frameDone) {
  BgLayer *bg = &g_zenv.ppu->bgLayer[1];
  int carry_x = 0, carry_y = 0;
  bool off_camera = false;
  if (!frameDone && bg->useWorld && (enhanced_features0 & kFeatures0_WidescreenVisualFixes)) {
    carry_x = ScrollCarry(bg->hScroll, BG2HOFS_copy2);
    carry_y = ScrollCarry(bg->vScroll, BG2VOFS_copy2);
    off_camera = bg->hScroll != (BG2HOFS_copy2 & kScrollMask);
  }
  // A line swung past the end of the map has no tiles to show there. The stock fetch wrapped onto the
  // far side of the area, so the original never showed a hole; here the edge column repeats.
  bg->worldRepeatColumns = off_camera;
  bg->worldOffX += carry_x - s_carry_x;
  bg->worldOffY += carry_y - s_carry_y;
  s_carry_x = carry_x;
  s_carry_y = carry_y;
}
