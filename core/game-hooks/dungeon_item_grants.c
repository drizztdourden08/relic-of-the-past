/* @layer core-game-hooks @kind native */
// Dungeon-item shuffle — the seam that lets a small key, a big key, a map or a compass be
// granted to a NAMED dungeon instead of the one the player is standing in.
//
// Two facts of the vanilla design make this more than a substitution table:
//
// 1. The four families have ONE native receive id each, and the grant is written against
//    the CURRENT dungeon. misc.c's receipt applies a compass, a big key or a map as
//    link_* |= 0x8000 >> (cur_palace_index_x2 >> 1), and a small key as a bump of the live
//    count link_num_keys, which dungeon.c flushes into link_keys_earned_per_dungeon on
//    every room transition and on death. So a key found somewhere else credits whichever
//    dungeon the finder happens to be in, and the seed's logic is wrong.
// 2. The live key count is a CACHE of one entry of that array. Dungeon entry loads it
//    (link_num_keys = link_keys_earned_per_dungeon[slot]) and SaveDungeonKeys writes it
//    back, with the first castle's two indices folded onto one slot
//    (cur_palace_index_x2 == 2 reads slot 0). Writing the array while the cache is live for
//    the same slot would be undone by the next flush, so a key for the dungeon the player
//    is ALREADY in goes through the vanilla bump and only a foreign one is redirected.
//
// The target travels in the receive id (dungeon_item_ids.h). The resolver banks it as the
// pending target and hands the vanilla receive flow the family's own native id, so the
// receipt art, the message, the hold-up and the HUD refresh are the game's own, unchanged;
// the two seams inside misc.c's receipt then ask this file where the grant lands. The HUD
// needs nothing extra for the same reason: Link_ReceiveItem's own Hud_RefreshIcon still
// runs, and every HUD readout of these four families is already written against the current
// dungeon, so a foreign grant correctly shows nothing and a local one shows immediately.
//
// Gate: kFeatures3_DungeonItemGrants. Off, no target is ever banked and both seams return
// the caller's own vanilla expression verbatim.
#include "game_hooks_internal.h"
#include "dungeon_item_ids.h"

// The target banked by the resolver and consumed by whichever receipt seam owns that
// family, or -1 for none. A plain static rather than a save byte: arming and consuming
// happen inside ONE synchronous call chain (a seam resolves the id, calls Link_ReceiveItem,
// which calls AncillaAdd_ItemReceipt), so nothing here has to survive a frame, let alone a
// save. The native id it was armed for is kept alongside it so a target that was never
// consumed — the receipt bailed out with no free ancilla slot, the one path that drops a
// grant — is recognised as stale at the next receipt instead of landing on it.
static int g_pending_palace = -1;
static uint8 g_pending_native = 0;

static bool DungeonItemGate(void) {
  return (enhanced_features3 & kFeatures3_DungeonItemGrants) != 0;
}

// The first castle is the one dungeon that spans TWO palace indices: its rooms above ground
// run at index 1 (cur_palace_index_x2 == 2) and the escape passage beneath them at index 0,
// with the dungeon-toggle doors between the two zones flipping the live index. The dataset
// names the whole dungeon by index 0, so a targeted id for it always carries palace 0 and
// has to credit BOTH indices. The game folds the pair itself for the key count only.
static bool IsFirstCastle(int palace) {
  return palace <= 1;
}

// The earned-count slot a palace index reads and writes: the (cur_palace_index_x2 == 2 ? 0
// : ...) fold in dungeon.c and messaging.c, expressed once here.
static int KeySlotOfPalace(int palace) {
  return IsFirstCastle(palace) ? 0 : palace;
}

// The bitfield bit(s) a palace index owns in link_bigkey / link_dungeon_map / link_compass.
// Every read of those fields (the big-key doors, the HUD, the dungeon map screen) tests the
// LIVE index unfolded, so the first castle's grant sets the bit of each of its two zones —
// a big key found above ground still opens the cell reached from the passage, and either way
// round.
static int BitsOfPalace(int palace) {
  return IsFirstCastle(palace) ? (0x8000 | 0x4000) : 0x8000 >> palace;
}

// The slot the LIVE count currently caches, or -1 when no dungeon is loaded (outdoors and
// in every non-palace interior link_num_keys is 0xff and means nothing).
static int LiveKeySlot(void) {
  uint8 x2 = BYTE(cur_palace_index_x2);
  return x2 == 0xff ? -1 : KeySlotOfPalace(x2 >> 1);
}

// The second sanctioned extension of the 76-entry native bound, alongside
// GameHook_IsVirtualGrantId and GameHook_IsPrizeGrantId.
bool GameHook_IsDungeonItemGrantId(uint8 item) {
  return item >= DUNGEON_ITEM_VIRT_FIRST && DungeonItemPalaceOfId(item) < DUNGEON_ITEM_PALACE_COUNT;
}

// Pure presentation lookup for the draw seams: a targeted id draws as its family's own
// native item.
uint8 GameHook_DungeonItemPresentationOf(uint8 item) {
  return GameHook_IsDungeonItemGrantId(item) ? kDungeonItemNativeId[DungeonItemKindOfId(item)] : item;
}

// Resolve a grant id for the receive flow: a targeted id banks its dungeon and becomes the
// family's native receipt, every other id passes through untouched. Composes into
// GameHook_ResolveGrantItem, so every substitution seam and the delivery export resolve it
// in the line they already have. With the gate down — or no substitution seam open —
// nothing is banked and the caller still gets a valid native id, which the vanilla receipt
// then credits to the current dungeon exactly as it always did.
uint8 GameHook_ResolveDungeonItemGrant(uint8 item) {
  if (!GameHook_IsDungeonItemGrantId(item)) return item;
  uint8 native = kDungeonItemNativeId[DungeonItemKindOfId(item)];
  if (!DungeonItemGate() || !GrantSeamOpen()) return native;
  g_pending_palace = DungeonItemPalaceOfId(item);
  g_pending_native = native;
  printf("[Randomizer] Dungeon item grant resolved: 0x%02x -> native 0x%02x for palace %d\n",
         item, native, g_pending_palace);
  return native;
}

// The byte misc.c's receipt applies |item| to. |vanilla| is the caller's own
// &g_ram[kMemoryLocationToGiveItemTo[item]], passed in so the gate-down answer is that
// pointer verbatim. Gate up, a small key banked for a dungeon whose count is NOT the live
// one is written straight into that dungeon's earned-count byte; the vanilla bump-and-cap
// arithmetic and the HUD refresh behind it are untouched. Every other item, and a key for
// the dungeon the player is standing in, keeps the vanilla pointer.
uint8 *GameHook_ReceiptTargetByte(int item, uint8 *vanilla) {
  if (g_pending_palace < 0) return vanilla;
  // Gate down, or a receipt that is not the one this target was armed for: the target was
  // dropped by a receipt that never applied (the no-free-ancilla bail-out, the one path
  // that loses a grant), so it is discarded here rather than left to land on this one.
  if (!DungeonItemGate() || (uint8)item != g_pending_native) {
    g_pending_palace = -1;
    return vanilla;
  }
  // A bitfield family is the bit seam's to consume; only the key count is written here.
  if (g_pending_native != kDungeonItemNativeId[0]) return vanilla;
  int slot = KeySlotOfPalace(g_pending_palace);
  int live = LiveKeySlot();
  g_pending_palace = -1;
  if (slot == live) return vanilla;
  printf("[Randomizer] Dungeon key grant: slot %d (live slot %d)\n", slot, live);
  return &link_keys_earned_per_dungeon[slot];
}

// The bit misc.c's receipt sets for a compass, a big key or a map. |vanilla_bit| is the
// caller's own 0x8000 >> (cur_palace_index_x2 >> 1) — the correct answer for an unshuffled
// grant and the only answer with the gate down. With a target banked it is that dungeon's
// bit instead, consumed so the next grant starts clean.
int GameHook_DungeonItemBit(int vanilla_bit) {
  if (!DungeonItemGate() || g_pending_palace < 0) return vanilla_bit;
  if (g_pending_native == kDungeonItemNativeId[0]) return vanilla_bit;
  int palace = g_pending_palace;
  g_pending_palace = -1;
  printf("[Randomizer] Dungeon item bit: palace %d -> 0x%04x\n", palace, BitsOfPalace(palace));
  return BitsOfPalace(palace);
}

// Read side for the probes: the palace a receipt in flight will credit, -1 for none.
// Ungated like GameHook_PrizeTakenMask — the target is only ever ARMED under the gate.
int GameHook_PendingDungeonItemPalace(void) {
  return g_pending_palace;
}
