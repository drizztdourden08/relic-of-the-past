/* @layer core-game-hooks @kind native */
// Paying for a randomized shelf.
//
// The vendored purchase routine knows exactly one currency: ShopItem_HandleCost tests
// and subtracts rupees and nothing else. A randomized shelf may ask for arrows, bombs,
// health or the contents of a bottle instead, so the deduction lives here, split into a
// PURE test and a write that only ever runs after that test passed — the same shape the
// vendored shelves use, so a refusal can never leave a half-paid file behind.
//
// Two hazards this file exists to avoid:
//   - the refill drain (Hud_RefillLogic) tops the ammo and health counters back up from
//     their filler bytes every frame, so a deduction that leaves a filler standing is
//     handed straight back; every branch clears the filler it competes with;
//   - health is NOT paid through the damage path. That path plays the hurt sound, sets
//     the blink timer, counts a hit and, on underflow, enters the death module. A price
//     is not damage, so this writes the counter directly (the shape cheats.c uses) and
//     refuses outright unless the player is left standing.
//
// Nothing here is gated: it is only ever reached from the gated shelf seam in
// shop_overrides.c, which is the single place these functions are called from.
#include "game_hooks_internal.h"
#include "shop_payment.h"
#include "src/hud.h"

// A bottle slot holding what this price demands, or -1. A bee price accepts the
// good bee too: it is the same bottled thing, only worth more to keep.
static int FindPricedBottle(uint16 wanted) {
  for (int i = 0; i < 4; i++) {
    uint8 have = link_bottle_info[i];
    if (have == wanted) return i;
    if (wanted == SHOP_BOTTLE_BEE && have == SHOP_BOTTLE_GOOD_BEE) return i;
  }
  return -1;
}

// Pure test: can the player pay this price right now? No state is touched, so a
// refusal leaves the file exactly as the vendored shelves leave a failed purchase.
bool ShopCanPay(uint8 currency, uint16 amount) {
  switch (currency) {
  case kShopCurrency_Rupees: return amount <= link_rupees_goal;
  case kShopCurrency_Arrows: return amount <= link_num_arrows;
  case kShopCurrency_Bombs: return amount <= link_item_bombs;
  // Paying must leave the player standing: a price can never take the last unit
  // of health, and the vendored damage path (the only other writer) is never entered.
  case kShopCurrency_Hearts: return link_health_current > amount * SHOP_UNITS_PER_HEART;
  case kShopCurrency_Bottle: return FindPricedBottle(amount) >= 0;
  default: return false;
  }
}

// Takes the payment. Only ever called after ShopCanPay said yes, so every branch
// is a plain subtraction that cannot underflow. The matching filler is cleared
// wherever one exists, because a pending refill would otherwise hand the payment
// straight back a frame later (Hud_RefillLogic).
void ShopTakePayment(uint8 currency, uint16 amount) {
  switch (currency) {
  case kShopCurrency_Rupees:
    link_rupees_goal -= amount;
    break;
  case kShopCurrency_Arrows:
    link_num_arrows -= (uint8)amount;
    link_arrow_filler = 0;
    break;
  case kShopCurrency_Bombs:
    link_item_bombs -= (uint8)amount;
    link_bomb_filler = 0;
    break;
  case kShopCurrency_Hearts:
    link_health_current -= (uint8)(amount * SHOP_UNITS_PER_HEART);
    link_hearts_filler = 0;
    break;
  case kShopCurrency_Bottle: {
    int slot = FindPricedBottle(amount);
    if (slot >= 0) link_bottle_info[slot] = SHOP_BOTTLE_EMPTY;
    // The item box shows bottle contents, so it has to be rebuilt like every
    // other place the game empties a bottle (LinkItem_Bottle).
    Hud_Rebuild();
    break;
  }
  default:
    break;
  }
}

