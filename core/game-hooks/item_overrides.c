/* @layer core-game-hooks @kind native */
// Overrides are keyed by (room, chest slot). The slot is the chest's ordinal within its
// room — the Nth entry for that room in the native chest table, the same ordinal the
// interacting attribute tile encodes (tile - 0x58, dungeon.c:5710). That expression is
// already in scope at the one vendored call site (player.c, Link_PerformOpenChest), so
// the hook needs no extra vendored plumbing: the caller passes the slot directly.
// Keying on the slot instead of the chest's original item byte lets two chests in one
// room with identical vanilla contents carry two different overrides.
#include "game_hooks_internal.h"

#define MAX_OVERRIDES 256

typedef struct {
  uint16 room_id;
  uint8 slot;
  uint8 new_item;
  // Pre-rendered contextual receipt-message id for THIS grant (session dialogue),
  // or -1 to fall back to the item-class template line.
  int16 msg;
} ItemOverride;

static ItemOverride g_overrides[MAX_OVERRIDES];
static int g_override_count = 0;

uint8 GameHook_OverrideChestItem(uint16 room_id, int slot, uint8 original_item) {
  // Neutral (the untouched item) when the gate is off, not a bare return, so a populated override
  // table left over from a prior session can never silently substitute an item while disabled.
  if (!(enhanced_features3 & kFeatures3_ItemOverrides)) return original_item;
  // A refusal sentinel (sign bit set: the chest did not open, e.g. a large-chest lock) must pass
  // through so the caller's bail-out still fires — an override may never bypass the lock.
  if (sign8(original_item)) return original_item;
  for (int i = 0; i < g_override_count; i++) {
    if (g_overrides[i].room_id == room_id && g_overrides[i].slot == (uint8)slot) {
      printf("[Randomizer] Override applied: room %d slot %d, item 0x%02x -> 0x%02x\n",
             room_id, slot, original_item, g_overrides[i].new_item);
      // An override fires on chest-open with no host in the loop, so the contextual
      // receipt message is armed natively here: the entry's own pre-rendered line
      // when the session assigned one, the item-class template otherwise (a no-op
      // while kFeatures3_ReceiptMessages is off — see receipt_messages.c).
      if (g_overrides[i].msg >= 0)
        GameHook_ArmReceiptMessageIfClear(g_overrides[i].msg);
      // The returned id flows into the vanilla chest receive path (which indexes the
      // 76-entry owned-duplicate alternates by it), so a virtual id must resolve
      // HERE — an upgrade's counter arithmetic runs and its native presentation
      // item is what the chest visibly grants; a progressive id becomes the next
      // tier's native id from live inventory.
      // The prize resolver composes after it on the same id: the two own disjoint spans
      // and each passes a foreign id through, so a prize crystal in a chest banks its own
      // bit and hands the chest the native crystal receipt rather than an id past the
      // 76-entry tables.
      uint8 resolved = GameHook_ResolvePrizeItem(GameHook_ResolveGrantItem(g_overrides[i].new_item));
      if (g_overrides[i].msg < 0)
        GameHook_ArmReceiptClassMessage(resolved, kReceiptMsg_Generic);
      return resolved;
    }
  }
  return original_item;
}

// No gate test in either export below: they only RECORD the request, exactly like
// WasmSetHudHidden/WasmSetPauseHidden (emscripten_api.c) — the gate is enforced at the one
// place the table is APPLIED, GameHook_OverrideChestItem above. Testing enhanced_features3
// here was the same class of bug as the doubled-HUD one: the caller arms the gate and writes
// the table in one synchronous burst, but the gate word only latches into WRAM at the next
// SyncGateWords() (zelda_rtl.c, next frame), so every write during session start was silently
// refused and the session ran with an empty table.
// |msg| is the entry's contextual receipt-message id, or -1 for the class default.
EMSCRIPTEN_KEEPALIVE
void WasmSetChestSlotOverride(int room_id, int slot, int new_item, int msg) {
  if (g_override_count >= MAX_OVERRIDES) {
    printf("[Randomizer] Override table full!\n");
    return;
  }
  // Update existing entry if one matches
  for (int i = 0; i < g_override_count; i++) {
    if (g_overrides[i].room_id == (uint16)room_id && g_overrides[i].slot == (uint8)slot) {
      g_overrides[i].new_item = (uint8)new_item;
      g_overrides[i].msg = (int16)msg;
      printf("[Randomizer] Updated override: room %d slot %d -> 0x%02x (msg %d)\n",
             room_id, slot, new_item, msg);
      return;
    }
  }
  g_overrides[g_override_count].room_id = (uint16)room_id;
  g_overrides[g_override_count].slot = (uint8)slot;
  g_overrides[g_override_count].new_item = (uint8)new_item;
  g_overrides[g_override_count].msg = (int16)msg;
  g_override_count++;
  printf("[Randomizer] Added override: room=%d slot=%d -> 0x%02x (msg %d)\n",
         room_id, slot, new_item, msg);
}

EMSCRIPTEN_KEEPALIVE
void WasmClearItemOverrides(void) {
  g_override_count = 0;
  printf("[Randomizer] Cleared all overrides\n");
}

// The sliding shelf that opens the escape passage only moves for a player who owns the
// light source. Vanilla guarantees that item from the starting house chest before the
// shelf is ever reached, so the gate is invisible in normal play — but with chest
// contents overridden the guarantee is gone and the escape soft-locks. The reference
// randomizer removes the requirement from its patched game outright; an armed override
// session waives it the same way. Vanilla sessions keep the original gate untouched.
bool GameHook_MantleRequirementSatisfied(void) {
  if (link_item_torch) return true;
  return (enhanced_features3 & kFeatures3_ItemOverrides) != 0;
}
