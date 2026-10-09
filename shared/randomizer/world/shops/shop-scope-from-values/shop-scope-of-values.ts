/* @layer shared-game @kind logic */
import { clampDepth } from '../shop-slots';
import { isShopShuffleMode } from '../shop-scope';
import { SHOP_MODE_KEY, SHOP_SLOT_COUNT_KEY, SHOP_SLOT_DEPTH_KEY } from '../shop-slot-options.data';
import { enabledSlotsOf } from './enabled-slots-of';
import type { OptionValues } from '../../options.type';
import type { ShopScope, ShopShuffleMode } from '../shop-scope.type';

const numberAt = (values: OptionValues, key: string, fallback: number): number => {
  const value = values[key];
  return typeof value === 'number' ? value : fallback;
};

const modeOf = (values: OptionValues): ShopShuffleMode => {
  const raw = values[SHOP_MODE_KEY];
  return isShopShuffleMode(raw) ? raw : 'vanilla';
};

const shopScopeOfValues = (values: OptionValues, seed = ''): ShopScope => ({
  mode: modeOf(values),
  enabled: enabledSlotsOf(values),
  slotCount: numberAt(values, SHOP_SLOT_COUNT_KEY, 0),
  depth: clampDepth(numberAt(values, SHOP_SLOT_DEPTH_KEY, 1)),
  seed,
});

export { shopScopeOfValues };
