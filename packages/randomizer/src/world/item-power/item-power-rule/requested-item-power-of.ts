/* @layer shared-game @kind logic */
import { DEFAULT_ITEM_POWER } from '../item-power.constants';
import type { World } from '../../world.type';
import type { ItemPowerSetting } from '@rotp/game-core';

const requestedItemPowerOf = (world: World): ItemPowerSetting =>
  world.options.itemPower ?? DEFAULT_ITEM_POWER;

export { requestedItemPowerOf };
