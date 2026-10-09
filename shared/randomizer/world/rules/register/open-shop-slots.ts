/* @layer shared-game @kind logic */
import { isShopSlotLocation } from '../../shops/shop-slots';
import { always } from '../combinators';
import type { World } from '../../world.type';

const openShopSlots = (world: World): void => {
  for (const key of world.locationsByKey.keys()) {
    if (isShopSlotLocation(key) && !world.locationRules.has(key)) {
      world.locationRules.set(key, always);
    }
  }
};

export { openShopSlots };
