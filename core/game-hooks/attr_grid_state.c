/* @layer core-game-hooks @kind native */
// Snapshot/restore for the WRAM scratch WasmBuildOverworldAttrGrid's vendored decode step uses.
//
// Overworld_DecompressAndDrawOneQuadrant (vendored, overworld.c) decodes compressed tile data into a
// fixed WRAM scratch span at g_ram+0x14000: the two interleave passes it runs cover g_ram+0x14000
// through +0x141FF, and its map16-tile decode cache (map16_decode_0..3, map16_decode_last,
// map16_decode_tmp — variables.h) sits at +0x14400 through +0x14443, inside the same span the
// decompressor's own scratch write also reaches. None of this is the caller's own buffer: the
// caller-supplied destination the tiles are actually written into is a private scratch array owned
// by the query, never this span.
//
// A real screen load leaves this span fully overwritten every time it runs, so it is not read across
// separate loads — but a "query" run mid-session has no business leaving whatever it decoded sitting
// in the live run's copy of that WRAM span once the read is done. Snapshot it before the decode and
// put it back after, on every return path (including the gated-off one), so calling this export can
// never be observed from inside a live run.
#include "game_hooks_internal.h"

enum {
  kAttrGridScratchOffset = 0x14000,
  // Covers both the interleave scratch (0x14000-0x141FF) and the map16-decode cache
  // (0x14400-0x14443) in one contiguous span, with margin either side.
  kAttrGridScratchBytes = 0x500,
};

static uint8 g_attr_grid_scratch_snapshot[kAttrGridScratchBytes];

void AttrGridState_Snapshot(void) {
  memcpy(g_attr_grid_scratch_snapshot, g_ram + kAttrGridScratchOffset, kAttrGridScratchBytes);
}

void AttrGridState_Restore(void) {
  memcpy(g_ram + kAttrGridScratchOffset, g_attr_grid_scratch_snapshot, kAttrGridScratchBytes);
}
