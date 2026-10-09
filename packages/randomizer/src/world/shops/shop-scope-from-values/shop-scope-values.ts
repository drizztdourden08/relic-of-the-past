/* @layer shared-game @kind logic */
import {
  SHOP_MODE_KEY, SHOP_SLOT_COUNT_KEY, SHOP_SLOT_DEPTH_KEY, SHOP_SLOT_ROWS,
} from '../shop-slot-options';
import type { OptionValues } from '../../options.type';
import type { ShopScope } from '../shop-scope.type';

const shopScopeValues = (scope: ShopScope): OptionValues => {
  const ticked = new Set(scope.enabled);
  return {
    [SHOP_MODE_KEY]: scope.mode,
    [SHOP_SLOT_COUNT_KEY]: scope.slotCount,
    [SHOP_SLOT_DEPTH_KEY]: scope.depth,
    ...Object.fromEntries(SHOP_SLOT_ROWS.map((row) => [row.key, ticked.has(row.canonicalIndex)])),
  };
};

export { shopScopeValues };
