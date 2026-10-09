/* @layer shared-game @kind logic */
import { DEFAULT_ITEM_POWER } from '../item-power.data';
import type { World } from '../../world.type';
import type { ItemPowerSetting } from '../item-power.type';

const requestedItemPowerOf = (world: World): ItemPowerSetting =>
  world.options.itemPower ?? DEFAULT_ITEM_POWER;

export { requestedItemPowerOf };
