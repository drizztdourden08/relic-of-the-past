/* @layer shared-game @kind constants */
import { CANONICAL_SLOTS } from '../shop-slot-facts';
import type { ShopScope } from '../shop-scope.type';

const NO_SHOP_SCOPE: ShopScope = { mode: 'vanilla', enabled: [], slotCount: 0, depth: 1, seed: '' };

const TOTAL_SHOP_SLOTS = CANONICAL_SLOTS.length;

export { NO_SHOP_SCOPE, TOTAL_SHOP_SLOTS };
