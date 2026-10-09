/* @layer shared-game @kind logic */
import { beamSwordReachable, progressiveSettingOf, swordReachable } from '../../progressive/progressive-reach';
import { derivedItemPower } from './derived-item-power';
import { requestedItemPowerOf } from './requested-item-power-of';
import type { World } from '../../world.type';
import type { ItemPowerSetting } from '@rotp/game-core';

const itemPowerOf = (world: World): ItemPowerSetting => {
  const tiers = progressiveSettingOf(world);
  return derivedItemPower(requestedItemPowerOf(world), swordReachable(tiers), beamSwordReachable(tiers));
};

export { itemPowerOf };
