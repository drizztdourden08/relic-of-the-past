/* @layer shared-game @kind logic */
import { normalizeEnabled } from '../shop-scope';
import {
  DEFAULT_SHOP_SHUFFLE_MODE, DEFAULT_SHOP_SLOT_DEPTH, SHOP_SLOT_ROWS,
} from '../shop-slot-options';
import type { ShopScope } from '../shop-scope.type';

const defaultShopScope = (): ShopScope => ({
  mode: DEFAULT_SHOP_SHUFFLE_MODE,
  enabled: normalizeEnabled(SHOP_SLOT_ROWS.filter((row) => row.defaultOn).map((row) => row.canonicalIndex)),
  slotCount: 0,
  depth: DEFAULT_SHOP_SLOT_DEPTH,
  seed: '',
});

export { defaultShopScope };
