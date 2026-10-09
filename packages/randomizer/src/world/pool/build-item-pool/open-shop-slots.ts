/* @layer shared-game @kind logic */
import { isShopSlotLocation } from '../../shops/shop-slots';
import type { World } from '../../world.type';

const openShopSlots = (world: World): number =>
  [...world.locationsByKey.keys()].filter((name) => isShopSlotLocation(name)).length;

export { openShopSlots };
