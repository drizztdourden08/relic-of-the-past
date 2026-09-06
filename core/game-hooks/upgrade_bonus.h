/* @layer core-game-hooks @kind native */
// The capacity pickup bonus (upgrade_bonus.c): what a virtual capacity grant hands over
// beside the ceiling it raises. Included from game_hooks.h, so every vendored seam sees
// it with the rest of the hook surface.
#ifndef GAME_HOOKS_UPGRADE_BONUS_H
#define GAME_HOOKS_UPGRADE_BONUS_H

#include "src/types.h"

// ─── Resolver side (upgrade_grants.c, wallet_grants.c, capacity_progressive.c) ───

// Call before the climb: remembers |family|'s ceiling as it stands, the base a step
// bonus is measured from. Record-only; nothing without the gate.
void GameHook_UpgradeBonusCapture(int family);

// Call after the climb, with the receipt item the grant presents as and whether any rung
// was actually climbed. Computes the bonus, drops the pond arithmetic's own refill of a
// counted family, and arms the amount for that receipt's payout seam. A grant that
// climbed nothing arms nothing: the consolation keeps its native goods.
void GameHook_UpgradeBonusArm(int family, uint8 presentation, bool climbed);

// ─── Vendored payout seams (misc.c AncillaAdd_ItemReceipt, ancilla.c) ───

// The goods the receipt of |item| pays out: the armed bonus when that receipt is the
// one a capacity grant is riding (consumed on the first read), |native| — the
// expression the vendored code wrote — for every other receipt and whenever the gate
// is down.
int GameHook_ReceiptPayout(uint8 item, int native);

// Frame end (GameHook_ModuleFrameEnd): an arm whose receipt is no longer alive is
// dropped, so it can never attach to a later, unrelated receipt.
void GameHook_UpgradeBonusFrameEnd(void);

#endif  // GAME_HOOKS_UPGRADE_BONUS_H
