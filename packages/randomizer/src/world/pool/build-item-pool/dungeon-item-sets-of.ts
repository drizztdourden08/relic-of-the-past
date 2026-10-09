/* @layer shared-game @kind logic */
import { dungeonItemsOf } from './dungeon-items-of';
import { partitionDungeonItems } from './partition-dungeon-items';
import type { ItemKey } from '../../item-ids';
import type { LocationKey } from '../../location-key';
import type { World } from '../../world.type';
import type { DungeonItemSetting } from '../../dungeon-items/dungeon-item.type';
import type { DungeonItemSets } from '../pool.type';

const dungeonItemSetsOf = (
  world: World, lockedScope: ReadonlySet<LocationKey>, setting: DungeonItemSetting,
): DungeonItemSets => {
  const dungeonItems = new Map<string, readonly ItemKey[]>();
  const escaped: ItemKey[] = [];
  for (const dungeon of world.dungeons.values()) {
    const items = dungeonItemsOf(dungeon, world.options.keyDropShuffle, lockedScope);
    dungeonItems.set(dungeon.name, partitionDungeonItems(items, setting, escaped));
  }
  return { dungeonItems, escaped };
};

export { dungeonItemSetsOf };
