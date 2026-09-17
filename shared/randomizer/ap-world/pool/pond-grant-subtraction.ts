/* @layer shared-game @kind logic */
/**
 * Pool-side arithmetic of a wish pond at Vanilla grants: each slot she keeps
 * holds the item her upgrade produces, so that item leaves the pool, one copy
 * per slot (pond/pond-vanilla-slots.ts).
 *
 * One overlap is real and expected. The npc scope's own lock can already have
 * taken the last copy: with its switch off, `Brewery` keeps a Red Boomerang,
 * and the baseline pool carries only one. The vanilla game holds two Red
 * Boomerangs, so both locks are right about their own slot, and the pool
 * never had a copy for the second. That slot then displaces a filler,
 * never the Blue Boomerang the player needs to throw. The count of such
 * slots is returned for the caller's filler balance.
 *
 * A produced item missing from the pool with NO scope lock holding it is a
 * porting bug, and throws.
 */
import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from '../scope-vanilla.data';

/** How many locked scope rows pin this item, so the overlap above can be told from a bug. */
const scopeCopiesOf = (item: string, lockedScope: ReadonlySet<string>): number =>
  [...NPC_SCOPE_LOCATIONS, ...WORLD_ITEM_SCOPE_LOCATIONS]
    .filter(([location, vanilla]) => vanilla === item && lockedScope.has(location)).length;

/** Remove each produced item from `pool` (in place); returns the slots the pool had no copy for. */
const removePondGrantsFromPool = (
  pool: string[], grants: ReadonlyMap<string, string> | undefined, lockedScope: ReadonlySet<string>,
): number => {
  let uncovered = 0;
  const overlap = new Map<string, number>();
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
