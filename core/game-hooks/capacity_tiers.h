/* @layer core-game-hooks @kind native */
// The native tier grids of the capacity families — one definition for every hook that
// walks them (the upgrade resolver, the receipt export, the new-file seam) — and the
// hook-owned wallet ladder, plus the RUNG convention every hook shares.
//
// A ladder rung is what the profile counts in. Rung 0 is the empty tier below every
// native grid: no explosives or projectiles at all, an unusable meter, a zero wallet.
// Rung r >= 1 is native level r-1, so the native bytes keep their vanilla meaning; the
// empty rung is a hook-owned save byte per family (capacity_profile.c). The two counted
// families keep the upgrade pond's own eight levels: display-coded values that double as
// the [Number] message digits and as the refill target (the HUD drain stops at the level
// cap, hud.c). The wallet has no native ladder at all — its cap table is ours, in
// 100-rupee steps ending in 99 like the vanilla 999, up to the 9999 the CarryMoreRupees
// ceiling allows.
#ifndef CAPACITY_TIERS_H
#define CAPACITY_TIERS_H

#include "src/types.h"

#define CAPACITY_TIER_COUNT 8
// Rung 8 = native level 7, the eighth pond level.
#define CAPACITY_LAST_RUNG CAPACITY_TIER_COUNT
static const uint8 kCapacityTiersBombsHex[CAPACITY_TIER_COUNT] = {0x10, 0x15, 0x20, 0x25,
                                                                   0x30, 0x35, 0x40, 0x50};
static const uint8 kCapacityTiersArrowsHex[CAPACITY_TIER_COUNT] = {0x30, 0x35, 0x40, 0x45,
                                                                    0x50, 0x55, 0x60, 0x70};

// The meter's three native cost levels (full, half, quarter); rung 3 = quarter.
#define METER_LEVEL_COUNT 3
#define METER_LAST_RUNG METER_LEVEL_COUNT

// Wallet ladder index i => cap 0 for i = 0, 100 * i - 1 for i in 1..100: rung 10 is the
// vanilla 999, rung 100 the 9999 ceiling.
#define WALLET_LADDER_LAST 100
#define WALLET_VANILLA_RUNG 10
#define WALLET_STEP_RUPEES 100

static inline int WalletLadderIndexClamp(int i) {
  return i < 0 ? 0 : i > WALLET_LADDER_LAST ? WALLET_LADDER_LAST : i;
}

static inline uint16 WalletCapOfIndex(int i) {
  int rung = WalletLadderIndexClamp(i);
  return rung == 0 ? 0 : (uint16)(WALLET_STEP_RUPEES * rung - 1);
}

// The virtual receive ids of the PROGRESSIVE capacity items (capacity_progressive.c), one
// per family in the profile's family order, above the wallet slots 0x67-0x76:
//   0x77 explosives · 0x78 projectiles · 0x79 meter · 0x7A wallet
// Mirrored by shared/game/data/capacity-progressive-receive-id.ts.
#define PROGRESSIVE_CAPACITY_VIRT_FIRST 0x77
#define PROGRESSIVE_CAPACITY_VIRT_LAST 0x7A

#endif  // CAPACITY_TIERS_H
