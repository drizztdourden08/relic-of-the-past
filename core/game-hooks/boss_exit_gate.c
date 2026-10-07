/* @layer core-game-hooks @kind native */
// The boss-exit exemption a substituted milestone receipt loses.
//
// A falling milestone prize is handed over as `item_receipt_method = 3; Link_ReceiveItem(id)`
// (ancilla.c, Ancilla29_MilestoneItemReceipt). Method 3 makes ancilla_step 3, and the receipt
// cleanup at the end of Ancilla22_ItemReceipt runs the dungeon boss exit for every step-3
// receipt EXCEPT four ids it names outright:
//   `if (ancilla_step[k] == 3 && a != 0x10 && a != 0x26 && a != 0xf && a != 0x20)`
// Those four are the two tablet medallions (0x10, 0x0f), the screen-clear heart container
// (0x26) and the dungeon crystal (0x20). The first three are handed over where no dungeon
// exit has any meaning; the crystal is excluded for a different reason, and IsExitExemptId
// below says why it is left out of this restoration.
//
// The test is on the id the receipt carries, so substituting any of those four makes the
// exemption stop matching and the boss exit runs where vanilla never ran it. On the overworld
// that is fatal: PrepareDungeonExitFromBossFight looks the live dungeon_room_index up in
// kDungeonExit_From, an overworld room is not in that table, FindInByteArray answers -1 and
// the assert on the next line aborts the core. The two tablets reach it on every seed that
// assigns them something else, which is what the abort on the mountain tablet was.
//
// This restores exactly the exemption the ORIGINAL item's own id performed, and nothing else:
// the vanilla id of the receipt in flight is recorded at the substitution seam before any
// table lookup, and the cleanup asks whether THAT id was one of the four. A receipt the table
// never touched answers with its own id, which the vendored test already excluded, so the hook
// only ever changes the substituted case.
//
// Gate: kFeatures3_NpcOverrides, the same table that can make this substitution in the first
// place. Off, the query is always false and the vendored expression runs byte-for-byte.
#include "game_hooks_internal.h"

// The vanilla receive id of the receipt now in flight. Overwritten at every pass through the
// substitution seam, so a stale value can never outlive its own receipt (the arm-once flag
// this replaced could, whenever a substituted id happened to be exempt itself).
static uint8 g_receipt_vanilla_id = 0;

// Three of the four ids the vendored cleanup excludes from the boss exit: the ones handed
// over where a dungeon exit has no meaning at all.
//
// The fourth, the crystal (0x20), is deliberately NOT here. It is excluded in vanilla because
// its own receipt ends by transmuting into the rising crystal, whose cutscene submodule IS a
// dungeon-exit sequence (prize_grants.c says the same). Substitute a crystal dungeon's prize
// for a pendant and that cutscene never runs, so the boss exit is the only way out of the
// arena: restoring the exemption there would trade this crash for a softlock. Prize shuffle
// assigns 0x20 away on a normal seed, so this distinction is load-bearing, not theoretical.
static bool IsExitExemptId(uint8 item) {
  return item == 0x10 || item == 0x0f || item == 0x26;
}

void GameHook_NoteReceiptVanillaId(uint8 vanilla_item) {
  g_receipt_vanilla_id = vanilla_item;
}

bool GameHook_SubstitutedReceiptSkipsBossExit(void) {
  if (!(enhanced_features3 & kFeatures3_NpcOverrides)) return false;
  if (!IsExitExemptId(g_receipt_vanilla_id)) return false;
  printf("[Randomizer] Substituted milestone receipt: keeping vanilla id 0x%02x's boss-exit exemption\n",
         g_receipt_vanilla_id);
  return true;
}
