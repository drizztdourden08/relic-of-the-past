/* @layer core-game-hooks @kind native */
// Retro bow, the shop half: what the shelves that sold arrows sell instead.
//
// Under retro an arrow shelf has nothing worth selling, and yet one purchase has to
// survive somewhere or the bow never fires: the QUIVER, sold once (Shops.py
// set_up_shops locks it onto the shield shop's arrow shelf at 80). When the profile
// shuffles its shops, the quiver is a placed item like any other and that shelf carries
// whatever the fill gave it, so the armed-shop table (shop_overrides.c) sells that and
// this file is never armed. When the profile keeps its shops VANILLA nothing is placed
// anywhere, so the stock is changed in place instead, here:
//   - the quiver's shelf sells the quiver at the reference's price until it is owned, and
//     a potion refill at its own vanilla price from then on;
//   - every other shelf that sold arrows sells the same refill at its own price.
// A refill, because arrows are what the shelf was for and a potion is the nearest thing
// a shop still has to offer; which potion, and at what price, is data the host arms.
//
// "Owned" is the arrow counter, exactly as the shot seam reads it (retro_bow.c): the
// quiver arrives as a single arrow, so an emptied shelf needs no byte of its own and
// a save state carries the fact for free.
//
// ONE seam, in the shopkeeper dispatch (sprite_main.c Sprite_BB_Shopkeeper), right after
// the armed-shop seam so a shelf the table owns is never handled twice. Gate off, or no
// shelf armed for this spot, and the vendored handler runs byte for byte.
#include "game_hooks_internal.h"
#include "shop_payment.h"
#include "shop_draw.h"
#include "src/sprite.h"
#include "src/sprite_main.h"

#define MAX_RETRO_SHELVES 8
#define RETRO_SHELF_ENTRANCE_ANY (-1)
#define RETRO_SHELF_OW_AREA_ANY (-1)

// The receipt the quiver arrives as: a single arrow, which is what makes the counter
// non-zero (kValueToGiveItemTo writes 1 into the arrow filler for it).
#define RETRO_QUIVER_RECEIPT 0x43

// "Not enough rupees", and "no empty bottle", the two refusals the vendored shelves show.
#define SHOP_MSG_TOO_POOR 0x17c
#define SHOP_MSG_NO_BOTTLE 0x16d

typedef struct {
  uint8 armed;
  uint16 room_id;
  int16 entrance;      // RETRO_SHELF_ENTRANCE_ANY when the room alone names the shop
  int16 ow_area;       // RETRO_SHELF_OW_AREA_ANY when no door of its own reaches it
  uint8 subtype;       // the shelf sprite's own subtype
  uint16 quiver_price; // 0 for a shelf that only ever sells the refill
  uint8 refill_item;
  uint16 refill_price;
} RetroShelf;

static RetroShelf g_retro_shelves[MAX_RETRO_SHELVES];
static int g_retro_shelf_count = 0;

// Whether this entry names the shelf the game is drawing right now: the same three
// narrowing fields the armed-shop table keys on (shop_table.c), in the same order.
static bool ShelfMatches(const RetroShelf *entry, uint8 subtype) {
  if (!entry->armed || entry->subtype != subtype) return false;
  if (entry->room_id != dungeon_room_index) return false;
  if (entry->entrance >= 0 && (uint8)entry->entrance != which_entrance) return false;
  return entry->ow_area < 0 || (uint16)entry->ow_area == overworld_area_index_exit;
}

static const RetroShelf *FindShelf(uint8 subtype) {
  if (!GameHook_RetroBowActive()) return NULL;
  for (int i = 0; i < g_retro_shelf_count; i++) {
    if (ShelfMatches(&g_retro_shelves[i], subtype)) return &g_retro_shelves[i];
  }
  return NULL;
}

// What the shelf is selling right now, and for how much.
static void ShelfStock(const RetroShelf *entry, uint8 *item, uint16 *price) {
  bool quiver = entry->quiver_price != 0 && link_num_arrows == 0;
  *item = quiver ? RETRO_QUIVER_RECEIPT : entry->refill_item;
  *price = quiver ? entry->quiver_price : entry->refill_price;
}

// Shelf seam. True: this shelf is a retro-stocked one and has been fully handled, so
// the vendored dispatch is skipped. False for every other sprite.
bool GameHook_RetroShopItem(int k) {
  uint8 subtype = sprite_subtype2[k];
  const RetroShelf *entry = FindShelf(subtype);
  if (entry == NULL) return false;
  uint8 item;
  uint16 price;
  ShelfStock(entry, &item, &price);

  if (!GameHook_DrawShopShelf(k, item, kShopCurrency_Rupees, price))
    SpriteDraw_ShopItem(k);
  if (Sprite_ReturnIfInactive(k)) return true;
  Sprite_BehaveAsBarrier(k);
  if (!ShopItem_CheckForAPress(k)) return true;
  // A refill needs a bottle to pour into, the same refusal the vendored potion shelf gives.
  if (item != RETRO_QUIVER_RECEIPT && Sprite_Find_EmptyBottle() < 0) {
    Sprite_ShowMessageUnconditional(SHOP_MSG_NO_BOTTLE);
    ShopItem_PlayBeep(k);
    return true;
  }
  if (!ShopCanPay(kShopCurrency_Rupees, price)) {
    Sprite_ShowMessageUnconditional(SHOP_MSG_TOO_POOR);
    ShopItem_PlayBeep(k);
    return true;
  }
  ShopTakePayment(kShopCurrency_Rupees, price);
  sprite_state[k] = 0;
  // The vendored receipt, byte for byte: the item, the shopkeeper's line, the cut short.
  ShopItem_HandleReceipt(k, item);
  printf("[Randomizer] Retro shelf: room 0x%03x area 0x%02x sub %d sold 0x%02x for %d\n",
         entry->room_id, overworld_area_index_exit, subtype, item, price);
  return true;
}

// Record-only setter, the shared contract: the gate latches a frame after the host
// writes it, so it is enforced at the seam above and never here.
EMSCRIPTEN_KEEPALIVE
void WasmSetRetroShelf(int room_id, int entrance, int ow_area, int subtype, int quiver_price,
                       int refill_item, int refill_price) {
  if (g_retro_shelf_count >= MAX_RETRO_SHELVES) {
    printf("[Randomizer] Retro shelf table full, ignoring room 0x%03x sub %d\n", room_id, subtype);
    return;
  }
  g_retro_shelves[g_retro_shelf_count++] = (RetroShelf){
    1, (uint16)room_id, (int16)entrance, (int16)ow_area, (uint8)subtype,
    (uint16)quiver_price, (uint8)refill_item, (uint16)refill_price,
  };
  printf("[Randomizer] Armed retro shelf: room=0x%03x ent=%d area=%d sub=%d quiver=%d refill=0x%02x at %d\n",
         room_id, entrance, ow_area, subtype, quiver_price, refill_item, refill_price);
}

EMSCRIPTEN_KEEPALIVE
void WasmClearRetroShelves(void) {
  g_retro_shelf_count = 0;
}

// Headless probe: what the shelf of |subtype| in the room the harness staged would sell
// this frame, as item | price << 8, or -1 for a shelf this file does not own. Gated on
// the REQUESTED developer-tools bit like every other probe (capacity_probes.c).
EMSCRIPTEN_KEEPALIVE
int WasmProbeRetroShelfStock(int subtype) {
  if ((g_wanted_gate_words[0] & kFeatures0_DeveloperTools) == 0) return -1;
  const RetroShelf *entry = FindShelf((uint8)subtype);
  if (entry == NULL) return -1;
  uint8 item;
  uint16 price;
  ShelfStock(entry, &item, &price);
  return item | (price << 8);
}
