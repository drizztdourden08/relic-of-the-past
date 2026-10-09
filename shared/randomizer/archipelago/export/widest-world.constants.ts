/* @layer shared-game @kind constants */
import { CANONICAL_SLOTS } from '../../world/shops/shop-slot-facts';
import { MAX_SHOP_SLOT_DEPTH } from '../../world/shops/shop-slots';
import type { ShopScope } from '../../world/shops/shop-scope.type';

const WIDEST_SHOP_SCOPE: ShopScope = {
  mode: 'custom',
  enabled: CANONICAL_SLOTS.map((_slot, index) => index),
  slotCount: CANONICAL_SLOTS.length,
  depth: MAX_SHOP_SLOT_DEPTH,
  seed: 'archipelago',
};

export { WIDEST_SHOP_SCOPE };
