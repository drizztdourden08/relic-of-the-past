/* @layer core-game-hooks @kind native */
// The header of the US name entry with a Japanese set: the Japanese cartridge's own 名前登録 title, eight
// tiles wide and two high, drawn centred in the US header box. Its tiles are background sheet 57's (the
// host's Japanese graphics pack, else the set's own copy, both extracted from a Japanese cartridge),
// tiles 6 to 13 over 22 to 29, put in VRAM at the tile numbers the Japanese screen gives them, which
// the US name entry leaves unused. With neither copy the box stays empty. See select_us_ja.h.
#include "game_hooks_internal.h"
#include "src/load_gfx.h"

enum {
  kBgKind = 1,
  kSheet = 57,
  kTopFirst = 6,
  kBottomFirst = 22,
  kTiles = 8,
  kTile3bpp = 24,
  kTileWords = 16,
  kChrBase = 0x2000,
  kTopTile = 0x86,
  kBottomTile = 0x96,
  kPalette = 0x0800,
  kMapBase = 0x1000,
  kRow = 5,
  kCol = 11,
  kMapCols = 32,
  kDecompBytes = 0x4000,
};

static uint8 g_sheet[kDecompBytes];

static const uint8 *Sheet(void) {
  uint32 size = 0;
  const uint8 *compressed = JaGraphics_PackSheet(kBgKind, kSheet, &size);
  if (compressed == NULL)
    compressed = LanguageScreensAssets_SetSheet(kBgKind, kSheet);
  bool whole = compressed != NULL && Decompress(g_sheet, compressed) >= (kBottomFirst + kTiles) * kTile3bpp;
  return whole ? g_sheet : NULL;
}

static void PutRow(uint8 *p, int half) {
  uint16 addr = (uint16)(kMapBase + (kRow + half) * kMapCols + kCol);
  p[0] = (uint8)(addr >> 8);
  p[1] = (uint8)addr;
  p[2] = 0;
  p[3] = (uint8)(2 * kTiles - 1);
  for (int i = 0; i < kTiles; i++) {
    uint16 w = (uint16)(kPalette | ((half ? kBottomTile : kTopTile) + i));
    p[4 + 2 * i] = (uint8)w;
    p[5 + 2 * i] = (uint8)(w >> 8);
  }
}

// Tiles |count| from sheet tile |first| into VRAM at tile |tile|, their colour 1 (the Japanese box's own
// dark fill) made transparent so the glyphs sit on the US box's black like its other text.
static void Upload(const uint8 *sheet, int first, int tile) {
  uint8 *dst = (uint8 *)&g_zenv.vram[kChrBase + tile * kTileWords];
  Do3To4Low16Bit(dst, sheet + first * kTile3bpp, kTiles);
  for (int t = 0; t < kTiles; t++, dst += 2 * kTileWords) {
    for (int y = 0; y < 8; y++) {
      uint8 fill = (uint8)(dst[2 * y] & ~dst[2 * y + 1] & ~dst[16 + 2 * y] & ~dst[17 + 2 * y]);
      dst[2 * y] &= (uint8)~fill;
    }
  }
}

int SelectUsJaName_AppendHeader(uint8 *out, int room) {
  const uint8 *sheet = g_zenv.vram != NULL ? Sheet() : NULL;
  if (sheet == NULL)
    return 0;
  int row_bytes = 4 + 2 * kTiles;
  if (2 * row_bytes > room)
    return -1;
  Upload(sheet, kTopFirst, kTopTile);
  Upload(sheet, kBottomFirst, kBottomTile);
  PutRow(out, 0);
  PutRow(out + row_bytes, 1);
  return 2 * row_bytes;
}
