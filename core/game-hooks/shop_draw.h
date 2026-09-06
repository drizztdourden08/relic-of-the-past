/* @layer core-game-hooks @kind native */
// The shelf picture: the item a randomized shelf is really selling, and the price under
// it. Split out of shop_overrides.c so the seam file stays about the purchase.
#ifndef GAME_HOOKS_SHOP_DRAW_H
#define GAME_HOOKS_SHOP_DRAW_H

#include "src/types.h"
#include "shop_payment.h"

// Draws the shelf as |grant| — the entry's own id, virtual ids included — with |amount|
// of |currency| priced under it. False when the assigned item has no art, leaving the
// caller to fall back to the vendored draw.
bool GameHook_DrawShopShelf(int k, uint8 grant, uint8 currency, uint16 amount);

#endif  // GAME_HOOKS_SHOP_DRAW_H
