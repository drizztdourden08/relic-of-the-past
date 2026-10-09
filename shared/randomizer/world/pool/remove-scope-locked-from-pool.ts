/* @layer shared-game @kind logic */
import { BOTTLE_ITEMS } from '../item-groups';
import { PLAIN_BOTTLE } from './scope-subtraction.constants';
import { scopeRows } from './scope-rows';
import { isDungeonScopedItem } from './is-dungeon-scoped-item';
import type { ItemId } from '@shared/game/data/types/ids';
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';

const removeScopeLockedFromPool = (pool: ItemKey[], lockedLocations: ReadonlySet<LocationKey>): void => {
  for (const [location, item] of scopeRows()) {
    if (!lockedLocations.has(location) || isDungeonScopedItem(item)) continue;
    let index = pool.indexOf(item);
    if (index === -1 && item === PLAIN_BOTTLE) {
      index = pool.findIndex((held) => BOTTLE_ITEMS.includes(held as ItemId));
    }
    if (index === -1) throw new Error(`npc-scope lock exceeds pool: ${item}`);
    pool.splice(index, 1);
  }
};

export { removeScopeLockedFromPool };
