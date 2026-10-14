/* @layer shared-game @kind logic */
import { DEFAULT_DIFFICULTY } from '../../difficulty/difficulty';
import { REFERENCE_CAPACITY_PROFILE } from '../../capacity/capacity-profile-defaults';
import { DEFAULT_DUNGEON_ITEM_SETTING } from '../../dungeon-items/dungeon-item-modes';
import type { World } from '../../world.type';
import type { PoolSettings } from './build-item-pool.type';

const poolSettingsOf = (world: World): PoolSettings => {
  const { includeNpcChecks = true, capacity = REFERENCE_CAPACITY_PROFILE } = world.options;
  const { includeWorldItems = includeNpcChecks, capacityProgressive = false } = world.options;
  const { dungeonItems: dungeonItemSetting = DEFAULT_DUNGEON_ITEM_SETTING } = world.options;
  const { difficulty = DEFAULT_DIFFICULTY } = world.options;
  return { includeNpcChecks, includeWorldItems, capacity, capacityProgressive, dungeonItemSetting, difficulty };
};

export { poolSettingsOf };
