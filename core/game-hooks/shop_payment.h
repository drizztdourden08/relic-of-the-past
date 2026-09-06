/* @layer core-game-hooks @kind native */
// What a randomized shelf may charge, and how it takes it. Split out of
// shop_overrides.c so the shelf seam stays about the shelf: this file owns the
// currencies and nothing else.
#ifndef GAME_HOOKS_SHOP_PAYMENT_H
#define GAME_HOOKS_SHOP_PAYMENT_H

#include "src/types.h"

// Currency tags, shared with shared/randomizer/ap-world/shops/shop-price-native.ts.
enum {
  kShopCurrency_Rupees = 0,
  kShopCurrency_Arrows = 1,
  kShopCurrency_Bombs = 2,
  kShopCurrency_Hearts = 3,
  kShopCurrency_Bottle = 4,
};
// The game stores health in eighths of a heart, and a bottle slot holds 2 when empty.
// The bottled things a price may demand run 3-7 in the slot's own values.
#define SHOP_UNITS_PER_HEART 8
#define SHOP_BOTTLE_EMPTY 2
#define SHOP_BOTTLE_RED_POTION 3
#define SHOP_BOTTLE_BEE 7
#define SHOP_BOTTLE_GOOD_BEE 8

// True when the player can pay this price right now. Pure: nothing is written, so a
// refusal leaves the file exactly as a failed vendored purchase leaves it.
bool ShopCanPay(uint8 currency, uint16 amount);

// Takes the payment. Only ever called after ShopCanPay returned true.
void ShopTakePayment(uint8 currency, uint16 amount);

// The line a refusal shows: |currency|'s own template line when the loaded dialogue blob
// carries it, else |vendored_msg|, the line the vendored spot shows. Rupees always keep
// the vendored line, which already names them (shop_refusal.c).
int ShopRefusalMessage(uint8 currency, uint16 amount, int vendored_msg);

// The line a purchase shows over the hold-up: the shop's own template line when the loaded
// dialogue blob carries it, else |fallback| (-1 for no box at all). shop_refusal.c.
int ShopPurchaseMessage(int fallback);

#endif  // GAME_HOOKS_SHOP_PAYMENT_H
