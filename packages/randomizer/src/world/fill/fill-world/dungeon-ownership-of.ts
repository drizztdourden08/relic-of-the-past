/* @layer shared-game @kind logic */
import type { ItemKey } from '../../item-ids';
import type { LocationKey } from '../../location-key';
import type { World } from '../../world.type';
import type { DungeonOwnership } from '../fill.type';

const dungeonOwnershipOf = (world: World): DungeonOwnership => {
  const locationDungeon = new Map<LocationKey, string>();
  const itemDungeon = new Map<ItemKey, string>();
  for (const dungeon of world.dungeons.values()) {
    for (const regionName of dungeon.regions) {
      const region = world.regions.get(regionName);
      for (const location of region?.locations ?? []) {
        locationDungeon.set(location.key, dungeon.name);
      }
    }
    for (const item of [dungeon.smallKey, dungeon.bigKey, dungeon.map, dungeon.compass]) {
      if (item !== null) itemDungeon.set(item, dungeon.name);
    }
  }
  return { locationDungeon, itemDungeon };
};

export { dungeonOwnershipOf };
