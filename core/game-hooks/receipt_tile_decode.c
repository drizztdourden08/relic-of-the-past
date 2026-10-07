/* @layer core-game-hooks @kind native */
// The animated-tile decode every hook-side receipt draw goes through, made safe to run on a
// frame the game itself would never decode on.
//
// DecodeAnimatedSpriteTile_variable (load_gfx.c) decompresses two sheets over the WRAM
// scratch at 0x14000. The same first 0x80 bytes are also word_7F4000: the table of 64 VRAM
// destinations Map16ToMap8 (overworld.c) builds for a full tilemap redraw, which
// NMI_HandleArbitraryTileMap (nmi.c) reads when it uploads the rows. That upload is split
// over two frames (NMI subroutines 12 then 13, or 4 in one go), so the table has to survive
// from the frame it is built until the second half is sent.
//
// The game never decodes a receipt picture inside that window. The randomizer's world item
// draws do: a substituted item standing on the destination screen of a mirror warp is drawn
// every frame the warp loads its overlay and map. The decode then turns the destination
// table into sheet bytes, the NMI copies the overlay rows to those bogus addresses, and the
// real overlay rows are never written. The screen shows garbage tiles over the terrain,
// with pieces of the tilemap and the tile sheets scribbled over, until the next full load.
//
// So the table is put back after the decode. Nothing vanilla reads those bytes as sheet
// data after the decode returns: the one deferred reader, the currency receipt's cycle
// (ancilla.c), reads at offset 0x600 and above. Callers run only under their own gates,
// so with those gates down this code never runs.
#include "game_hooks_internal.h"
#include "src/load_gfx.h"

enum {
  kStripeTableOffset = 0x14000,
  kStripeTableBytes = 0x80,
};

void GameHook_DecodeReceiptTiles(uint8 gfx) {
  uint8 table[kStripeTableBytes];
  memcpy(table, g_ram + kStripeTableOffset, kStripeTableBytes);
  DecodeAnimatedSpriteTile_variable(gfx);
  memcpy(g_ram + kStripeTableOffset, table, kStripeTableBytes);
}
