/* @layer core-game-hooks @kind native */
// The armed-shop table and its host exports — see shop_table.h for the keying and the
// counters. Everything here is record-only or a plain read: the gate is enforced at the
// APPLICATION site in shop_overrides.c, the SyncGateWords latching contract every
// override table in this tree follows.
#include "game_hooks_internal.h"
#include "shop_table.h"
#include "src/assets.h"

#define MAX_SHOP_OVERRIDES 200

static ShopSlotOverride g_shop_overrides[MAX_SHOP_OVERRIDES];
static int g_shop_override_count = 0;

// Whether this entry names the spot the game is drawing right now. The three shop fields
// narrow in order — room, then the entrance walked through, then the overworld area that
// entrance was taken from — and each may be "any" for a shop the earlier fields already
// pin down on their own.
static bool EntryKeyMatches(const ShopSlotOverride *entry, uint8 subtype) {
  if (!entry->armed || entry->subtype != subtype) return false;
  if (entry->room_id != dungeon_room_index) return false;
  if (entry->entrance >= 0 && (uint8)entry->entrance != which_entrance) return false;
  return entry->ow_area < 0 || (uint16)entry->ow_area == overworld_area_index_exit;
}

const ShopSlotOverride *ShopFindEntry(uint8 subtype, bool *sold_out) {
  *sold_out = false;
  const ShopSlotOverride *owner = NULL;
  for (int i = 0; i < g_shop_override_count; i++) {
    const ShopSlotOverride *entry = &g_shop_overrides[i];
    if (!EntryKeyMatches(entry, subtype)) continue;
    owner = entry;
    // The receipt arrays are exactly 76 entries — anything past them corrupts g_ram (the
    // same bound the drop and standing tables enforce), so an oversized id armed by a
    // buggy host is ignored rather than sold or drawn. The virtual ids (upgrade, wallet
    // and progressive) are the one sanctioned exception: they resolve to a native item
    // before any array.
    if (entry->new_item >= 76 && !GameHook_IsVirtualGrantId(entry->new_item)) continue;
    if (entry->depth_index == srm_shop_sold(entry->slot_index)) return entry;
  }
  if (owner != NULL) *sold_out = true;
  return NULL;
}

void ShopMarkSold(const ShopSlotOverride *entry) {
  if (srm_shop_sold(entry->slot_index) < entry->depth) srm_shop_sold(entry->slot_index)++;
}

bool ShopSlotSoldOut(const ShopSlotOverride *entry) {
  return srm_shop_sold(entry->slot_index) >= entry->depth;
}

// Record-only setter, the shared contract: gates latch a frame after the host writes
// them, so they are enforced at the application site, never here.
EMSCRIPTEN_KEEPALIVE
void WasmSetShopSlotOverride(int slot_index, int room_id, int entrance, int ow_area, int subtype,
                             int depth_index, int depth, int currency, int amount,
                             int new_item, int msg, int fire_id) {
  if (g_shop_override_count >= MAX_SHOP_OVERRIDES) {
    printf("[Randomizer] Shop slot override table full, ignoring room 0x%03x sub %d\n", room_id, subtype);
    return;
  }
  if (slot_index < 0 || slot_index >= SHOP_SLOT_COUNT) {
    printf("[Randomizer] Shop slot override refused: slot %d out of range\n", slot_index);
    return;
  }
  g_shop_overrides[g_shop_override_count++] = (ShopSlotOverride){
    1, (uint8)slot_index, (uint16)room_id, (int16)entrance, (int16)ow_area, (uint8)subtype,
    (uint8)depth_index, (uint8)depth, (uint8)currency, (uint16)amount,
    (uint8)new_item, (int16)msg, (int16)fire_id,
  };
  printf("[Randomizer] Armed shop slot override: room=0x%03x ent=%d area=%d sub=%d step=%d/%d -> 0x%02x\n",
         room_id, entrance, ow_area, subtype, depth_index + 1, depth, new_item);
}

EMSCRIPTEN_KEEPALIVE
void WasmClearShopSlotOverrides(void) {
  g_shop_override_count = 0;
  printf("[Randomizer] Cleared shop slot overrides\n");
}

// How many steps a slot has sold, for the host's own probes and the session's resume
// logic. Deliberately ungated, same doctrine as GameHook_SubstitutedGiftTaken: the byte is
// only ever written by a gated substitution, and once a step has been sold it must read as
// sold even if the session later stops.
EMSCRIPTEN_KEEPALIVE
int WasmGetShopSlotSold(int slot_index) {
  if (slot_index < 0 || slot_index >= SHOP_SLOT_COUNT) return -1;
  return srm_shop_sold(slot_index);
}

// The overworld area the current indoor visit was entered from — the value that tells two
// doors onto one shop apart. Exported so a probe can prove the discriminator is really
// there rather than trusting the dataset. Ungated: a plain read of one word.
EMSCRIPTEN_KEEPALIVE
int WasmGetEnteredOverworldArea(void) {
  return overworld_area_index_exit;
}

// The room an entrance leads to, straight out of the game's own entrance table. The shop
// dataset names each shop by the entrance the player walks through, and several shops
// share one entrance, so a wrong entrance value would silently point a shop at the wrong
// room. This export lets a test check every row of that dataset against the game itself
// instead of trusting a transcription. Ungated: a table read that changes nothing.
EMSCRIPTEN_KEEPALIVE
int WasmGetEntranceRoom(int entrance) {
  if (entrance < 0 || (size_t)entrance >= kEntranceData_rooms_SIZE / sizeof(uint16)) return -1;
  return kEntranceData_rooms[entrance];
}
