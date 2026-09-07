/* @layer core-game-hooks @kind native */
// The unfreeze a substituted boss reward loses.
//
// A boss's heart container is handed over as `item_receipt_method = 2; Link_ReceiveItem(0x3e)`
// (sprite_main.c, the `sprite_A[k]` branch). Method 2 makes ancilla_step 2, and step 2 is
// exactly what switches OFF the generic "clear the immobilize flag" fallback at the end of
// Ancilla22_ItemReceipt: `if (ancilla_step[k] != 2) flag_is_link_immobilized = 0;`. Vanilla is
// fine because the unfreeze comes from an id-specific branch in the same cleanup instead,
// `else if (a == 0x3e) { flag_is_link_immobilized = 0; ... }`, and 0x3e is what the boss always
// gives.
//
// Substitute that grant to anything else and `a` is the substituted id, so the 0x3e branch stops
// matching while step is still 2. Neither path clears the flag and the player is immobilized for
// good: the freeze reported after every boss, in every dungeon, on a randomized seed.
//
// This restores exactly the unfreeze the ORIGINAL item's own branch would have performed, and
// nothing else: armed only when a substitution replaced id 0x3e, consumed once by that receipt's
// own cleanup. The pond/fairy grants also ride method 2 but own their unfreeze in their sprite
// handler instead of in this cleanup, so they are deliberately left alone here.
//
// Gate: kFeatures3_NpcOverrides, the same table that can make this substitution in the first
// place. Off, the query is always false and the vendored expression runs byte-for-byte.
#include "game_hooks_internal.h"

// The one vanilla receive id whose receipt cleanup performs the unfreeze itself.
#define BOSS_HEART_ITEM 0x3e

// Armed by the substitution seam (npc_overrides.c) at the moment the grant is rolled, consumed
// frames later by the receipt's own cleanup. The gap spans the hold-up animation and the
// message box, which is why this is a flag and not a return value.
static bool g_needs_unfreeze = false;

void GameHook_MarkSubstitutedBossHeart(uint8 vanilla_item) {
  if (vanilla_item != BOSS_HEART_ITEM) return;
  g_needs_unfreeze = true;
}

bool GameHook_SubstitutedReceiptNeedsUnfreeze(void) {
  if (!(enhanced_features3 & kFeatures3_NpcOverrides)) return false;
  if (!g_needs_unfreeze) return false;
  g_needs_unfreeze = false;
  printf("[Randomizer] Substituted boss reward: restoring the unfreeze its vanilla id owned\n");
  return true;
}
