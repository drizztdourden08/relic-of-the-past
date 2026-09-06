/* @layer core-game-hooks @kind native */
// The wallet ladder's cheat seam: the one direct write the max-wallet cheat
// (cheat_wallet.c) makes into the ladder owner (capacity_profile.c). Kept out of
// game_hooks.h the way shop_payment.h and icon_overlays.h are, since only those two
// files speak it.
#ifndef GAME_HOOKS_WALLET_CHEAT_H
#define GAME_HOOKS_WALLET_CHEAT_H

#include "src/types.h"

// Put the file on ladder rung |rung| (clamped to the ladder, capacity_tiers.h), the way a
// level cheat lands a counted family on a native tier. The persisted index is the same
// byte a wallet upgrade climbs, so every ceiling reader (GameHook_WalletMax) follows it.
// Refused, and false, without a Custom wallet under kFeatures3_CapacityProfile: there is
// no ladder to stand on then and the native ceiling stays.
bool GameHook_WalletLadderSet(int rung);

#endif  // GAME_HOOKS_WALLET_CHEAT_H
