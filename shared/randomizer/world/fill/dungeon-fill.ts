/* @layer shared-game @kind logic */
import { fillRestrictive } from './fill-restrictive';
import { fillEligibleLocations } from './fill-world';
import { modeOfDungeonItem, staysInOwnDungeon } from '../dungeon-items/dungeon-item-modes';
import {
  BIG_KEY_RANK, OTHER_DUNGEON_ITEM_RANK, SMALL_KEY_RANK, SPECIFIC_SORT_BONUS,
} from './fill.constants';
import type { Rng } from '../../rng';
import type { ItemKey } from '../item-ids.data';
import type { FillWorld } from './fill-world.type';

const prefillDungeonItems = (fillWorld: FillWorld, rng: Rng): void => {
  const { world, pool, locationDungeon, itemDungeon, dungeonItems: setting, accessibility } = fillWorld;
  const items: ItemKey[] = [];
  for (const dungeon of world.dungeons.values()) {
    items.push(...(pool.dungeonItems.get(dungeon.name) ?? []));
  }
  const isSpecific = (item: ItemKey): boolean => staysInOwnDungeon(modeOfDungeonItem(setting, item));
  const rankOf = (item: ItemKey): number => {
    const dungeon = world.dungeons.get(itemDungeon.get(item) ?? '');
    const bonus = isSpecific(item) ? SPECIFIC_SORT_BONUS : 0;
    if (dungeon === undefined) return OTHER_DUNGEON_ITEM_RANK + bonus;
    if (item === dungeon.bigKey) return BIG_KEY_RANK + bonus;
    if (item === dungeon.smallKey) return SMALL_KEY_RANK + bonus;
    return OTHER_DUNGEON_ITEM_RANK + bonus;
  };
  items.sort((a, b) => rankOf(a) - rankOf(b));
  const locations = rng.shuffle(
    fillEligibleLocations(fillWorld).filter((key) => locationDungeon.has(key)),
  );
  fillRestrictive({
    world,
    items,
    locations,
    assumedItems: pool.pool,
    relaxWhenBeatable: accessibility === 'minimal',
    allowedAt: (item, location) =>
      !isSpecific(item) || itemDungeon.get(item) === locationDungeon.get(location),
  });
};

export { prefillDungeonItems };
