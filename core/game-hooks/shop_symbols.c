/* @layer core-game-hooks @kind native */
// The symbol beside a randomized shelf's price. The vendored shelves only ever charge
// rupees, so their price is bare digits and the room says the rest; a randomized shelf
// may charge arrows, bombs, hearts or a bottled thing, and the digits alone say nothing
// about which. So the price row carries the currency's own picture after the number, and
// a bottle price, which demands a thing and not a quantity, shows the picture alone.
//
// THE PICTURES come from the host: the sprite extraction reduces the nine currency
// drawings to sprite palette row SYMBOL_PALETTE_ROW and encodes each as the two 4bpp
// tiles of a 16x8 strip, 64 B in the order left tile, right tile, 576 B in all
// (shared/asset-extraction/item-sprites/currency-symbols.ts), handed over through MEMFS
// (WasmApplyCurrencySymbolsFile). Where the drawing sits inside its strip is read off the
// tiles when the file lands (the first and last painted column), so the shelf can butt
// the picture against its digits whatever margin the drawing carries, and an 8 px wide
// one spends one OAM entry: nothing about the shapes is hardcoded here.
//
// THE TILES are lent by the substituted-sprite pool (sprite_art_slots.c): a strip takes
// one tile row of the twenty the pool borrows, keyed by the symbol, so three shelves
// charging the same thing name one row. The draw's OAM entries carry the strip's row,
// so the picture reads in the drawing's own colours whatever row the digits use, and
// the same in both world halves, since row 4 is the one main sprite row the world
// offset never touches.
//
// Gate: none of its own, and none needed. The one caller is the gated shelf draw
// (shop_draw.c, reached only through kFeatures3_ShopOverrides), and it draws nothing
// until a 576 B file was applied; with the gate off no row is claimed, no OAM entry is
// written and the vendored shelf shows byte for byte.
#include "game_hooks_internal.h"
#include "shop_symbols.h"
#include "shop_payment.h"
#include "sprite_art_slots.h"
#include "src/sprite.h"
#include "src/util.h"
#include <stdlib.h>

#define SYMBOL_COUNT 9
// One strip: two 32 B tiles.
#define SYMBOL_TILE_BYTES 32
#define SYMBOL_BYTES (2 * SYMBOL_TILE_BYTES)
#define SYMBOLS_FILE_BYTES (SYMBOL_COUNT * SYMBOL_BYTES)
#define SYMBOL_TILE_WIDTH 8
#define SYMBOL_STRIP_WIDTH (2 * SYMBOL_TILE_WIDTH)
#define SYMBOL_ROWS 8
// The sprite palette row the strips are quantized to. Mirrored by
// CURRENCY_SYMBOL_PALETTE_ROW in the extractor that writes the file: change both together.
#define SYMBOL_PALETTE_ROW 4

// The strips in file order. Mirrored by CURRENCY_SYMBOL_FILES in the extractor: the four
// counted currencies first, then the bottled things in bottle-slot order (3 red potion,
// 4 green, 5 blue, 6 fairy, 7 bee), so a bottle price indexes them with no table.
enum {
  kSymbol_Rupee = 0,
  kSymbol_Arrow = 1,
  kSymbol_Bomb = 2,
  kSymbol_Heart = 3,
  kSymbol_Bottled = 4,
};

static uint8 g_symbols[SYMBOLS_FILE_BYTES];
// Per symbol; every width 0 until a file is loaded.
static ShopSymbolShape g_shape[SYMBOL_COUNT];

int ShopSymbolOf(uint8 currency, uint16 amount) {
  switch (currency) {
  case kShopCurrency_Rupees: return kSymbol_Rupee;
  case kShopCurrency_Arrows: return kSymbol_Arrow;
  case kShopCurrency_Bombs: return kSymbol_Bomb;
  case kShopCurrency_Hearts: return kSymbol_Heart;
  case kShopCurrency_Bottle:
    if (amount < SHOP_BOTTLE_RED_POTION || amount > SHOP_BOTTLE_BEE) return SHOP_SYMBOL_NONE;
    return kSymbol_Bottled + (amount - SHOP_BOTTLE_RED_POTION);
  default: return SHOP_SYMBOL_NONE;
  }
}

ShopSymbolShape ShopSymbolShapeOf(int id) {
  static const ShopSymbolShape none = {0, 0, 0};
  if (id < 0 || id >= SYMBOL_COUNT) return none;
  return g_shape[id];
}

int ShopDrawSymbol(OamEnt *oam, int id, int x, int y, uint8 priority) {
  ShopSymbolShape shape = ShopSymbolShapeOf(id);
  if (shape.tiles == 0) return 0;
  uint8 charnum = GameHook_ClaimArtStrip(id, g_symbols + id * SYMBOL_BYTES);
  if (charnum == 0) return 0;
  uint8 flags = (uint8)(SYMBOL_PALETTE_ROW * 2) | (priority & 0x30);
  for (int i = 0; i < shape.tiles; i++) {
    SetOamHelper0(oam + i, (uint16)(x + i * SYMBOL_TILE_WIDTH), (uint16)y, (uint8)(charnum + i), flags, 0);
  }
  return shape.tiles;
}

// The columns of the strip that paint anything: bit 15 is the leftmost pixel, bit 0 the
// rightmost. Each tile row holds bitplanes 0 and 1 at bytes 2r and 2r + 1 and bitplanes
// 2 and 3 at 16 + 2r and 17 + 2r; a pixel is painted when any plane has its bit.
static unsigned StripColumns(const uint8 *strip) {
  unsigned columns = 0;
  for (int tile = 0; tile < 2; tile++) {
    const uint8 *t = strip + tile * SYMBOL_TILE_BYTES;
    unsigned painted = 0;
    for (int r = 0; r < SYMBOL_ROWS; r++) painted |= t[2 * r] | t[2 * r + 1] | t[16 + 2 * r] | t[17 + 2 * r];
    columns |= painted << (tile == 0 ? SYMBOL_TILE_WIDTH : 0);
  }
  return columns;
}

// The shape of the strip at |strip|: the first and last painted column, and the tiles
// up to the last one. A blank strip has no shape and is never drawn.
static ShopSymbolShape StripShape(const uint8 *strip) {
  ShopSymbolShape shape = {0, 0, 0};
  unsigned columns = StripColumns(strip);
  if (columns == 0) return shape;
  int left = 0, right = SYMBOL_STRIP_WIDTH - 1;
  while (!(columns & (1u << (SYMBOL_STRIP_WIDTH - 1 - left)))) left++;
  while (!(columns & (1u << (SYMBOL_STRIP_WIDTH - 1 - right)))) right--;
  shape.left = left;
  shape.width = right + 1 - left;
  shape.tiles = right / SYMBOL_TILE_WIDTH + 1;
  return shape;
}

// Load the strips from a 576 B file the renderer wrote to MEMFS. Record-only, like every
// override setter; any other size is refused and leaves the previous strips alone.
EMSCRIPTEN_KEEPALIVE
int WasmApplyCurrencySymbolsFile(const char *path) {
  size_t length = 0;
  uint8 *file = path ? ReadWholeFile(path, &length) : NULL;
  if (file == NULL) {
    printf("[Randomizer] Price symbols: could not read %s\n", path ? path : "(null)");
    return 0;
  }
  bool ok = length == SYMBOLS_FILE_BYTES;
  if (ok) {
    memcpy(g_symbols, file, SYMBOLS_FILE_BYTES);
    for (int id = 0; id < SYMBOL_COUNT; id++) g_shape[id] = StripShape(g_symbols + id * SYMBOL_BYTES);
    printf("[Randomizer] Price symbols applied (%d B)\n", SYMBOLS_FILE_BYTES);
  } else {
    printf("[Randomizer] Price symbols refused: %u bytes, expected %d\n", (unsigned)length, SYMBOLS_FILE_BYTES);
  }
  free(file);
  return ok ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
void WasmClearCurrencySymbols(void) {
  memset(g_shape, 0, sizeof(g_shape));
  printf("[Randomizer] Cleared price symbols\n");
}
