/* @layer core-game-hooks @kind native */
// Drawing a randomized shelf: the item it is really selling, and the price under it.
//
// THE ITEM comes from the shared receipt-art helper, which decodes into the animated
// tile slot (charnums 0x24/0x34) and spends one or two OAM entries. |grant| is the
// entry's own id, virtual ids included — the standing and drop seams pass theirs the same
// way, and it is what lets the capacity icon and its palette row find the family. The
// three repaints then run in the order those seams use: icon, glint, commit.
//
// THE PRICE is the hard half. The vendored shelves draw their prices from a static table,
// and between all seven of them they reference exactly four glyphs — 0, 1, 3 and 5, the
// only digits the vanilla prices 10/30/50/150/500 ever need. The other six had to be
// found: the glyphs sit in pairs two rows apart (2,3 then 4,5 then 6,7 then 8,9), with 0
// and 1 off on their own, so nothing about the four could be extrapolated. The full set
// below was identified by drawing candidate charnums on a real shelf and reading the
// frames back, and every one of the ten is confirmed that way.
//
// The table stays DATA, settable from the host like every other table here, so a sheet
// that ever disagrees can be corrected without a rebuild. A price needing a glyph the
// table does not have draws no digits at all rather than drawing a wrong one.
//
// THE SYMBOL after the digits names the currency (shop_symbols.c): the price row is the
// digits, a one-pixel gap, then the drawing, centred as one on the item; a bottle price
// is the drawing alone. The strip is placed so the drawing's first painted column sits
// at the gap, whatever margin the drawing carries inside its tiles.
//
// BUDGET. The shelf sprite carries five OAM entries and no shadow slot, so the item art
// (1-2) leaves three free — enough for a three-digit price with no growth at all. A
// longer price, or the symbol's one or two entries, grows the region the way
// receipt_sprite_draw.c does, skipping the overflow for the one frame the growth takes
// to land.
#include "game_hooks_internal.h"
#include "shop_draw.h"
#include "shop_symbols.h"
#include "sprite_art_slots.h"
#include "src/sprite.h"
#include "src/sprite_main.h"

#define SHOP_DIGIT_UNKNOWN 0xff
#define SHOP_MAX_DIGITS 4
// The price row's top, under the 16x16 item art. The vendored row sits at 16, touching
// the art; this one leaves four pixels of counter between them.
#define SHOP_PRICE_Y 20
#define SHOP_DIGIT_WIDTH 8
// The item art's centre line, which the price row is centred on.
#define SHOP_ITEM_HALF 8
// Between the last digit's cell and the symbol's first painted column.
#define SHOP_SYMBOL_GAP 1
// The high byte every vendored price-digit entry carries: palette row 1, no flip, no
// priority bits of its own. It is XORed with the sprite's own base word exactly like a
// table entry, which is what turns it into the flags the game finally draws with.
#define SHOP_DIGIT_CHAR_FLAGS 0x0200

// charnum per digit, 0-9, in the shop room's own spriteset. SHOP_DIGIT_UNKNOWN marks a
// glyph the host has blanked; nothing ships that way.
static uint8 g_digit_tile[10] = {
  0x30, 0x31, 0x02, 0x03, 0x12, 0x13, 0x22, 0x23, 0x32, 0x33,
};

// Splits |amount| into digits, most significant first. Returns the count, or 0 when any
// digit it needs has no glyph — the caller then draws the item alone.
static int ShopPriceDigits(uint16 amount, uint8 *out) {
  uint8 reversed[SHOP_MAX_DIGITS];
  int count = 0;
  do {
    if (count == SHOP_MAX_DIGITS) return 0;
    uint8 digit = (uint8)(amount % 10);
    if (g_digit_tile[digit] == SHOP_DIGIT_UNKNOWN) return 0;
    reversed[count++] = g_digit_tile[digit];
    amount /= 10;
  } while (amount != 0);
  for (int i = 0; i < count; i++) out[i] = reversed[count - 1 - i];
  return count;
}

// Grows the sprite's OAM region to |body| entries plus its shadow, mirroring
// receipt_sprite_draw.c. False on the frame the growth was requested: this frame's
// region is still the old size, so the caller must not write past it.
static bool ShopEnsureOamRegion(int k, int body) {
  int shadow = (sprite_flags3[k] & 0x10) ? 1 : 0;
  int count = sprite_flags2[k] & 0x1f;
  if (count + 1 >= body + shadow) return true;
  sprite_flags2[k] = (uint8)((sprite_flags2[k] & ~0x1f) | (body + shadow - 1));
  return false;
}

// Entries the receipt helper spent on the item, read off the same table it reads: a
// 16x16 icon is one entry, an 8x16 one is two stacked.
static int ShopItemArtEntries(uint8 grant) {
  uint8 item = GameHook_GrantPresentationOf(grant);
  if (item >= 76) return 1;
  return kReceiveItem_Tab1[item] == 0 ? 2 : 1;
}

// Draws the price under the item: the digits, then the currency's symbol to their right,
// the row centred on the item the way the vendored tables centre their digits (a
// three-digit price runs -4/4/12, a two-digit one 0/8, so a symbol-less price lands
// exactly where the vendored one does). A bottle price is a thing, not a quantity, so it
// shows the symbol alone. |art| is how many entries the art already took.
static void DrawShopPrice(int k, int art, uint8 currency, uint16 amount) {
  uint8 tiles[SHOP_MAX_DIGITS];
  int count = currency == kShopCurrency_Bottle ? 0 : ShopPriceDigits(amount, tiles);
  if (count == 0 && currency != kShopCurrency_Bottle) return;
  int symbol = ShopSymbolOf(currency, amount);
  ShopSymbolShape shape = ShopSymbolShapeOf(symbol);
  int gap = (count > 0 && shape.width > 0) ? SHOP_SYMBOL_GAP : 0;
  if (count + shape.tiles == 0) return;
  if (!ShopEnsureOamRegion(k, art + count + shape.tiles)) return;
  PrepOamCoordsRet info;
  if (Sprite_PrepOamCoordOrDoubleRet(k, &info)) return;
  OamEnt *oam = GetOamCurPtr() + art;
  int x = info.x + SHOP_ITEM_HALF - (count * SHOP_DIGIT_WIDTH + gap + shape.width) / 2;
  int y = info.y + SHOP_PRICE_Y;
  for (int i = 0; i < count; i++) {
    // Sprite_DrawMultiple XORs every table entry with the sprite's own base word before
    // it reaches OAM, so a glyph taken FROM that table has to go through the same XOR to
    // come out as the tile the table meant. Writing the raw charnum instead draws
    // whatever else happens to sit at that index in the room's spriteset.
    uint16 d = (uint16)(SHOP_DIGIT_CHAR_FLAGS | tiles[i]) ^ WORD(info.r4);
    SetOamHelper0(oam + i, x + i * SHOP_DIGIT_WIDTH, y, d, d >> 8, 0);
  }
  ShopDrawSymbol(oam + count, symbol, x + count * SHOP_DIGIT_WIDTH + gap - shape.left, y, info.flags);
}

// The whole shelf picture. False when the assigned item has no art at all, which leaves
// the caller to fall back to the vendored draw.
//
// ORDER AGAINST THE PLAYER. The entries are allocated the way the vendored shelf draw
// allocates its own (Oam_AllocateDeferToPlayer): a shelf overlapping the player's
// footprint takes its entries after the player's when it stands above the player and
// before them when it stands below, so walking in front of a shelf covers the item and
// its price, and the priority bits against the room's layers are the sprite's own.
bool GameHook_DrawShopShelf(int k, uint8 grant, uint8 currency, uint16 amount) {
  Oam_AllocateDeferToPlayer(k);
  if (GameHook_HoldUpReceiptLive()) {
    // The decode slot is the held-up item's for these frames. A shelf keeps showing the
    // picture it committed last; one without a memo of its item (a spot that has just
    // restocked) shows nothing until the ceremony is over, and its price waits with it.
    if (!GameHook_DrawSpriteArtFromMemo(k, grant, 0, 0)) return true;
  } else {
    if (!GameHook_DrawSpriteAsReceiptItem(k, grant, 0, 0)) return false;
    // A capacity upgrade shows its own icon over the presentation's fresh decode.
    GameHook_WriteUpgradeIconFor(grant);
    // Last write before the upload, so the glint runs over the icon as well as the art.
    // It also consumes the arm the draw above set: left unconsumed it would ride to
    // whichever seam applied the glint next, with this shelf's palette row.
    GameHook_ApplyItemSheen();
    // The shelf's own tiles, before the next shelf on the same counter decodes over the
    // shared slot (three shelves showed one item without this, sprite_art_slots.c).
    // Last, so the block keeps the finished picture and not the bare decode, and the
    // memo keeps the same picture for the ceremony frames.
    GameHook_CommitSpriteArt(k);
    GameHook_MemoSpriteArt(k, grant);
  }
  DrawShopPrice(k, ShopItemArtEntries(grant), currency, amount);
  return true;
}

// Host-supplied digit glyphs, charnum per digit, 0xff for "no glyph". Deliberately
// ungated: it only fills a lookup table, and the gated draw above is the sole reader.
EMSCRIPTEN_KEEPALIVE
void WasmSetShopDigitTile(int digit, int charnum) {
  if (digit < 0 || digit > 9) return;
  g_digit_tile[digit] = (uint8)charnum;
  printf("[Randomizer] Shop digit %d -> tile 0x%02x\n", digit, charnum);
}

// What the core currently believes a digit's glyph is, so a probe can read the table
// back and a sweep can report which glyphs have been identified.
EMSCRIPTEN_KEEPALIVE
int WasmGetShopDigitTile(int digit) {
  return (digit < 0 || digit > 9) ? -1 : g_digit_tile[digit];
}
