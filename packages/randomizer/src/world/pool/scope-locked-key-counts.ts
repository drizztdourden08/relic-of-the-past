/* @layer shared-game @kind logic */
import { scopeRows } from './scope-rows';
import { isDungeonScopedItem } from './is-dungeon-scoped-item';
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';

const scopeLockedKeyCounts = (
  dungeonItems: readonly ItemKey[], lockedLocations: ReadonlySet<LocationKey>,
): Map<ItemKey, number> => {
  const counts = new Map<ItemKey, number>();
  for (const [location, item] of scopeRows()) {
    if (!lockedLocations.has(location)) continue;
    if (isDungeonScopedItem(item) && dungeonItems.includes(item)) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  }
  return counts;
};

export { scopeLockedKeyCounts };
