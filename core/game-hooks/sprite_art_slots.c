/* @layer core-game-hooks @kind native */
// Private tile blocks for the substituted world sprites: an object pool over a scarce
// hardware resource, lent one block per sprite per frame, and one tile row per shown
// price symbol.
//
// WHY THE SHARED SLOT CANNOT SERVE TWO SPRITES. Every substitution seam draws its item
// through receipt_sprite_draw.c, which decodes the art into the one animated-tile slot at
// 0xBD40 and points an OAM entry at charnum 0x24. An OAM entry names a TILE, not pixels:
// the pixels are read when the frame is rendered, out of the tiles the NMI mirrored the
// slot into (nmi.c, VRAM 0x4240/0x4340). So the slot is written many times per frame but
// read once, and every entry naming 0x24 shows whatever the LAST decode of that frame
// left there. Three shelves in one room drew three copies of the third one's item.
// Decoding again immediately before each sprite's own SetOam calls cannot help, for the
// same reason: nothing is read until the upload.
//
// WHAT THIS DOES INSTEAD. Each drawing sprite claims one of five blocks, keeps a copy of
// the finished picture (the decode plus whatever the capacity icon and the glint painted
// over it), and the frame end writes every claimed block into its own four tiles. The
// sprite's OAM entries name that block's charnum, so the three shelves name three
// different tiles and read three different pictures.
//
// WHERE THE TILES COME FROM. The sprite page's rows 0x20-0x2F and 0x30-0x3F are the
// animated half of the page; the per-frame DMA list fills 0x20-0x25 and 0x30-0x35 and
// leaves 0x26-0x2F and 0x36-0x3F holding the common sheet the tileset load put there.
// Those twenty tiles are exactly five 16x16 blocks, ten rows of two tiles. They are
// BORROWED, not taken: a row keeps the bytes it found and puts them back the frame it
// stops being claimed, so a room that does draw from them sees them again as soon as
// the substituted sprite is gone.
//
// A STRIP is one row lent on its own, to a 16x8 picture that several sprites may share
// (a shop price symbol, shop_symbols.c): it is keyed by the picture, not the sprite, so
// two shelves charging arrows name one row. Blocks are claimed from the first block up,
// strips from the last row down, so the two only meet when a room shows more than the
// twenty tiles can hold.
//
// Gate: none of its own, and none needed, because nothing here runs unless one of the gated
// substitution seams (shop, standing, drop, receive-crossing) drew a sprite this frame.
// With those gates off no row is ever claimed, so no tile is read, written or restored.
#include "game_hooks_internal.h"
#include "sprite_art_slots.h"
#include "decode_slot.h"

#define ART_SLOT_COUNT 5
#define ART_ROW_COUNT (ART_SLOT_COUNT * 2)
// One row of a block: two tiles, 32 B each.
#define ART_ROW_BYTES 64
// Word address of sprite tile 0 in the page the receipt draws name, and the tile pitch.
#define ART_VRAM_BASE 0x4000
#define ART_TILE_WORDS 16

// Top-left charnum of each block, in the two rows the per-frame DMA never fills.
static const uint8 kArtSlotChar[ART_SLOT_COUNT] = {0x26, 0x28, 0x2a, 0x2c, 0x2e};

enum { kArtRow_Free = 0, kArtRow_Block, kArtRow_Strip };

typedef struct {
  uint8 use;      // kArtRow_*: what took this row this frame
  int owner;      // that sprite's index (block) or the picture's id (strip), while taken
  bool pending;   // a picture was committed into |art| this frame
  bool holding;   // our picture is in the tiles and |backup| still has to go back
  uint8 art[ART_ROW_BYTES];
  uint8 backup[ART_ROW_BYTES];
} ArtRow;

// Row 2b is block b's top row, row 2b + 1 its bottom row.
static ArtRow g_rows[ART_ROW_COUNT];

static uint8 ArtRowChar(int row) {
  return (uint8)(kArtSlotChar[row >> 1] + ((row & 1) ? SPRITE_ART_ROW_STRIDE : 0));
}

// The 64 B of video memory holding tiles |charnum| and |charnum| + 1.
static uint8 *ArtTileRow(uint8 charnum) {
  return (uint8 *)&g_zenv.vram[ART_VRAM_BASE + charnum * ART_TILE_WORDS];
}

static bool RowIsBlockOf(int row, int k) {
  return g_rows[row].use == kArtRow_Block && g_rows[row].owner == k;
}

uint8 GameHook_ClaimSpriteArt(int k) {
  for (int b = 0; b < ART_SLOT_COUNT; b++) {
    if (RowIsBlockOf(2 * b, k)) return kArtSlotChar[b];
  }
  for (int b = 0; b < ART_SLOT_COUNT; b++) {
    if (g_rows[2 * b].use != kArtRow_Free || g_rows[2 * b + 1].use != kArtRow_Free) continue;
    for (int half = 0; half < 2; half++) {
      g_rows[2 * b + half].use = kArtRow_Block;
      g_rows[2 * b + half].owner = k;
    }
    return kArtSlotChar[b];
  }
  // More substituted sprites at once than there are blocks: the last ones share the
  // decode slot, exactly as every draw did before the pool existed.
  return SPRITE_ART_SHARED_CHAR;
}

void GameHook_CommitSpriteArtBytes(int k, const uint8 *art) {
  for (int b = 0; b < ART_SLOT_COUNT; b++) {
    if (!RowIsBlockOf(2 * b, k)) continue;
    // The decode slot's own order: the top row's two tiles, then the bottom row's.
    for (int half = 0; half < 2; half++) {
      memcpy(g_rows[2 * b + half].art, art + half * ART_ROW_BYTES, ART_ROW_BYTES);
      g_rows[2 * b + half].pending = true;
    }
    return;
  }
}

void GameHook_CommitSpriteArt(int k) {
  GameHook_CommitSpriteArtBytes(k, g_ram + DECODE_SLOT_ADDR);
}

uint8 GameHook_ClaimArtStrip(int id, const uint8 *tiles) {
  for (int row = 0; row < ART_ROW_COUNT; row++) {
    if (g_rows[row].use == kArtRow_Strip && g_rows[row].owner == id) return ArtRowChar(row);
  }
  for (int row = ART_ROW_COUNT - 1; row >= 0; row--) {
    if (g_rows[row].use != kArtRow_Free) continue;
    g_rows[row].use = kArtRow_Strip;
    g_rows[row].owner = id;
    memcpy(g_rows[row].art, tiles, ART_ROW_BYTES);
    g_rows[row].pending = true;
    return ArtRowChar(row);
  }
  return 0;
}

void GameHook_SpriteArtFrameEnd(void) {
  for (int row = 0; row < ART_ROW_COUNT; row++) {
    ArtRow *r = &g_rows[row];
    uint8 charnum = ArtRowChar(row);
    if (r->pending) {
      // Taken on the frame the row is first claimed, after the room's own graphics
      // loads have run, so what goes back is this room's bytes and not an older room's.
      if (!r->holding) memcpy(r->backup, ArtTileRow(charnum), ART_ROW_BYTES);
      r->holding = true;
      memcpy(ArtTileRow(charnum), r->art, ART_ROW_BYTES);
    } else if (r->holding) {
      memcpy(ArtTileRow(charnum), r->backup, ART_ROW_BYTES);
      r->holding = false;
    }
    r->pending = false;
    r->use = kArtRow_Free;
  }
}
