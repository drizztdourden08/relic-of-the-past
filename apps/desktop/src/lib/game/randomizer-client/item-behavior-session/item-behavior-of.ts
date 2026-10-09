/* @layer bridge-wasm @kind logic */
import { DEFAULT_ITEM_POWER } from '@shared/randomizer/world/item-power/item-power.data';
import { retroVanillaShelves } from '@shared/randomizer/world/retro/retro-shops';
import { derivedItemPower } from '@shared/randomizer/world/item-power/item-power-rule';
import {
  beamSwordReachable, swordReachable,
} from '@shared/randomizer/world/progressive/progressive-reach';
import { isFullLadder } from '../../progressive-tiers';
import { darkRoomLightWordOf } from '@rotp/game-core';
import type { PlacementStats } from '@shared/randomizer/world/fill/placement.type';
import type { ItemPowerSetting } from '@rotp/game-core';
import type { ItemBehaviorPlan } from './item-behavior-session.type';

const itemBehaviorOf = (stats: PlacementStats): ItemBehaviorPlan => {
  const { progressiveTiers: tiers, progressiveModes: modes, retroBow, darkRooms, storyGates } = stats;
  const itemPower = derivedItemPower(stats.itemPower, swordReachable(tiers), beamSwordReachable(tiers));
  const retroShelves = retroVanillaShelves(stats.shops, retroBow);
  const vanilla = isFullLadder(tiers, modes) && !retroBow.enabled
    && darkRoomLightWordOf(darkRooms) === 0
    && (Object.keys(itemPower) as Array<keyof ItemPowerSetting>)
      .every((field) => itemPower[field] === DEFAULT_ITEM_POWER[field]);
  return { tiers, modes, itemPower, darkRooms, retroBow, retroShelves, storyGates, vanilla };
};

export { itemBehaviorOf };
