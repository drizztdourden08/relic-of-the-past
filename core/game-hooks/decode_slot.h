/* @layer core-game-hooks @kind native */
// The shared animated-tile decode slot addressed as a 16x16 picture of 4bpp palette
// indices, for the two hooks that repaint what a world draw seam just decoded there
// (rupee_gem_draw.c recolours a gem, item_sheen.c sweeps a highlight over it).
//
// The slot is the 128 B at 0xBD40 that WriteTo4BPPBuffer_at_7F4000 (load_gfx.c) fills
// and the NMI mirrors into VRAM tiles 0x24/0x25 (top row) and 0x34/0x35 (bottom row) —
// so it is four 32 B tiles in the order top-left, top-right, bottom-left, bottom-right,
// the same layout the capacity icons are encoded in. Inside a tile, row |r| holds
// bitplanes 0 and 1 at bytes 2r and 2r+1 and bitplanes 2 and 3 at bytes 16+2r and
// 17+2r, most significant bit leftmost. Index 0 is transparent.
#ifndef GAME_HOOKS_DECODE_SLOT_H
#define GAME_HOOKS_DECODE_SLOT_H

#include "game_hooks_internal.h"

#define DECODE_SLOT_ADDR 0xBD40
#define DECODE_SLOT_SIDE 16

// The 32 B tile holding pixel (|x|, |y|) of the slot's 16x16 picture.
static inline uint8 *DecodeSlotTile(int x, int y) {
  return g_ram + DECODE_SLOT_ADDR + (((y >> 3) * 2 + (x >> 3)) * 32);
}

// The palette index of pixel (|x|, |y|); 0 is transparent.
static inline uint8 DecodeSlotGet(int x, int y) {
  const uint8 *tile = DecodeSlotTile(x, y);
  int r = (y & 7) * 2, bit = 7 - (x & 7);
  return (uint8)(((tile[r] >> bit) & 1) | (((tile[r + 1] >> bit) & 1) << 1) |
                 (((tile[16 + r] >> bit) & 1) << 2) | (((tile[17 + r] >> bit) & 1) << 3));
}

// Write palette index |index| (0-15) at pixel (|x|, |y|).
static inline void DecodeSlotPut(int x, int y, uint8 index) {
  uint8 *tile = DecodeSlotTile(x, y);
  int r = (y & 7) * 2, bit = 7 - (x & 7);
  const int off[4] = {r, r + 1, 16 + r, 17 + r};
  for (int p = 0; p < 4; p++) {
    uint8 mask = (uint8)(1 << bit);
    tile[off[p]] = (uint8)((index >> p) & 1 ? (tile[off[p]] | mask) : (tile[off[p]] & ~mask));
  }
}

#endif  // GAME_HOOKS_DECODE_SLOT_H
