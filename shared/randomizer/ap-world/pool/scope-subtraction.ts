/* @layer shared-game @kind logic */
/**
 * Pool-side arithmetic of the npc-scope lock, per LOCKED LOCATION: every
 * locked location keeps its vanilla item, so that item leaves the pool the
 * same way the key-drop option's locked keys leave their dungeon sets. The
 * caller supplies the locked location set (all of the scope with the option
 * off, the undeliverable remainder with it on). Global-pool removals are
 * exact-name, with one documented tolerance: a locked plain Bottle consumes
 * whichever rolled bottle variant the pool holds (contents are cosmetic,
 * logic treats the group as one item). A removal that finds nothing is a
 * porting bug and throws.
 */
import { BOTTLE_ITEMS } from '../item-names.data';
import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from '../scope-vanilla.data';

const PLAIN_BOTTLE = BOTTLE_ITEMS[0];

/** Both scope surfaces, iterated together: a locked row can come from either. */
const scopeRows = (): Array<[string, string]> =>
  [...NPC_SCOPE_LOCATIONS, ...WORLD_ITEM_SCOPE_LOCATIONS];

/** Locked items that are per-dungeon (removed from dungeon sets, not the pool). */
const isDungeonScopedItem = (name: string): boolean => name.startsWith('Small Key (');

/** Remove the locked locations' global-pool items from `pool` (in place). */
const removeScopeLockedFromPool = (pool: string[], lockedLocations: ReadonlySet<string>): void => {
  for (const [location, item] of scopeRows()) {
    if (!lockedLocations.has(location) || isDungeonScopedItem(item)) continue;
    let index = pool.indexOf(item);
    if (index === -1 && item === PLAIN_BOTTLE) {
      index = pool.findIndex((name) => (BOTTLE_ITEMS as readonly string[]).includes(name));
    }
    if (index === -1) throw new Error(`npc-scope lock exceeds pool: ${item}`);
    pool.splice(index, 1);
  }
};

/** How many of this dungeon's restricted items sit locked on scope locations. */
const scopeLockedKeyCounts = (
  dungeonItemNames: readonly string[], lockedLocations: ReadonlySet<string>,
): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const [location, item] of scopeRows()) {
    if (!lockedLocations.has(location)) continue;
    if (isDungeonScopedItem(item) && dungeonItemNames.includes(item)) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  }
  return counts;
};

export { removeScopeLockedFromPool, scopeLockedKeyCounts };
