/* @layer shared-game @kind logic */
/**
 * The item half of a world model: the pool Archipelago fills, the dungeon items placed before
 * it, each item's class, and the placement predicates (the engine's item rules) written out as
 * the items each fillable location refuses.
 */
import { USEFUL_ITEMS } from '../../world/pool/item-classes.data';
import { isProgressionUnder } from '../../world/pool/progression-class';
import { modeOfDungeonItem, staysInOwnDungeon } from '../../world/dungeon-items/dungeon-item-modes';
import type { FillWorld } from '../../world/fill/fill-world.type';
import type { ItemKey } from '../../world/item-ids.data';
import type { LocationKey } from '../../world/location-key';
import type { ItemClass, WorldModel } from './export.type';

type ItemHalf = Pick<WorldModel, 'pool' | 'dungeonItems' | 'classes' | 'forbidden' | 'fillerItem'>;

const countsOf = (items: readonly string[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const item of items) counts[item] = (counts[item] ?? 0) + 1;
  return counts;
};

/** The prefill's own order (fill/dungeon-fill.ts): big keys, then small keys, pinned ones first. */
const SPECIFIC_SORT_BONUS = 5;

const dungeonItemsOf = (fillWorld: FillWorld): WorldModel['dungeonItems'] => {
  const { world, pool, itemDungeon, dungeonItems: setting } = fillWorld;
  const rankOf = (item: ItemKey, pinned: boolean): number => {
    const dungeon = world.dungeons.get(itemDungeon.get(item) ?? '');
    const bonus = pinned ? SPECIFIC_SORT_BONUS : 0;
    if (dungeon?.bigKey === item) return 3 + bonus;
    return (dungeon?.smallKey === item ? 2 : 1) + bonus;
  };
  return [...pool.dungeonItems.values()].flat().map((item) => {
    const pinned = staysInOwnDungeon(modeOfDungeonItem(setting, item));
    return { item, dungeon: pinned ? itemDungeon.get(item) ?? null : null, rank: rankOf(item, pinned) };
  });
};

/** The item the pool carries most copies of among its filler: what an extra slot receives. */
const commonestFiller = (filler: readonly string[]): string => {
  const counts = Object.entries(countsOf(filler)).sort(([a, left], [b, right]) => right - left || a.localeCompare(b));
  if (counts.length === 0) throw new Error('pool carries no filler');
  return counts[0][0];
};

const forbiddenOf = (
  fillWorld: FillWorld, fillable: readonly LocationKey[], items: ReadonlySet<string>,
): Record<string, string[]> => {
  const forbidden: Record<string, string[]> = {};
  for (const key of fillable) {
    const allowed = fillWorld.world.getItemRule(key);
    const refused = [...items].filter((item) => !allowed(item as ItemKey)).sort();
    if (refused.length > 0) forbidden[key] = refused;
  }
  return forbidden;
};

interface ItemHalfInput {
  fillWorld: FillWorld;
  /** The locations Archipelago fills: present, not a prize or a locked spot. */
  fillable: readonly LocationKey[];
  /** The prizes: advancement whatever the pool says. */
  fixedProgression: ReadonlySet<string>;
  /** Items the world's rules read (read-items.ts). */
  read: ReadonlySet<string>;
  /** Items locked onto their spots, which still need a class. */
  locked: Iterable<string>;
}

const itemHalfOf = (input: ItemHalfInput): ItemHalf => {
  const { fillWorld, fillable, fixedProgression, read, locked } = input;
  const { pool } = fillWorld;
  const poolItems = [...pool.progression, ...pool.useful, ...pool.filler];
  const dungeonItems = dungeonItemsOf(fillWorld);
  const isProgression = isProgressionUnder(fillWorld.capacity);
  const classOf = (item: string): ItemClass => {
    if (fixedProgression.has(item) || isProgression(item as ItemKey)) return 'progression';
    if (read.has(item)) return 'progression_skip_balancing';
    return USEFUL_ITEMS.has(item as ItemKey) ? 'useful' : 'filler';
  };
  const every = new Set<string>([
    ...poolItems, ...dungeonItems.map((entry) => entry.item), ...fixedProgression, ...locked,
  ]);
  const placeable = new Set<string>([...poolItems, ...dungeonItems.map((entry) => entry.item)]);
  return {
    pool: countsOf(poolItems),
    dungeonItems,
    classes: Object.fromEntries([...every].sort().map((item) => [item, classOf(item)])),
    forbidden: forbiddenOf(fillWorld, fillable, placeable),
    fillerItem: commonestFiller(pool.filler),
  };
};

export { itemHalfOf };
export type { ItemHalfInput };
