/* @layer shared-game @kind logic */
import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from '../scope-tables';
import type { LocationKey } from '../location-key';
import type { ItemKey } from '../item-ids.data';

const scopeCopiesOf = (item: ItemKey, lockedScope: ReadonlySet<LocationKey>): number =>
  [...NPC_SCOPE_LOCATIONS, ...WORLD_ITEM_SCOPE_LOCATIONS]
    .filter(([location, vanilla]) => vanilla === item && lockedScope.has(location)).length;

const removePondGrantsFromPool = (
  pool: ItemKey[], grants: ReadonlyMap<LocationKey, ItemKey> | undefined,
  lockedScope: ReadonlySet<LocationKey>,
): number => {
  let uncovered = 0;
  const overlap = new Map<ItemKey, number>();
  for (const item of grants?.values() ?? []) {
    const index = pool.indexOf(item);
    if (index !== -1) {
      pool.splice(index, 1);
      continue;
    }
    const used = overlap.get(item) ?? 0;
    if (used >= scopeCopiesOf(item, lockedScope)) throw new Error(`pond vanilla grant exceeds pool: ${item}`);
    overlap.set(item, used + 1);
    uncovered += 1;
  }
  return uncovered;
};

export { removePondGrantsFromPool };
