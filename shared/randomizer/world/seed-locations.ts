/* @layer shared-game @kind logic */
/**
 * Which rows of the dataset a seed fills.
 *
 * THE RULE, read off the record and nothing else:
 *
 *  - a row scoped 'fixed' is never one. It is a real pickup and the seed leaves it alone, so
 *    no switch reaches it and its vanilla item stays what the chest table says.
 *  - a SHOP SLOT is never one here. A shelf opens through the shop scope, which decides how
 *    many slots a shop sells and how deep each one restocks, so build-world adds those rows
 *    from the shop surface instead of from the collection.
 *  - an EVENT is never one. It is a thing that happened, which the tracker reads from the
 *    ledger; the few the rules ask about are found by the sweep where they happen
 *    (events/story-events.data.ts), and none of them holds a reward.
 *  - an NPC row is one only under a scope. A scripted giver carries `scope: 'npc'`; a
 *    scope-less npc row reads a rung of a counter ladder (the fairy's bomb and arrow counts)
 *    and stands for no spot at all.
 *  - everything else is one: a chest, a key drop, a boss, a prize, a standing item, a dig
 *    spot, a pond slot.
 *
 * The rule replaces four transcribed lists of location names, one per half of the map. Its
 * set is pinned in tests/randomizer/world-from-records.keep.test.ts.
 */
import type { CheckRecord } from '@shared/game/data';

const isSeedLocation = (check: CheckRecord): boolean => {
  const { kind, scope } = check;
  if (scope === 'fixed') return false;
  if (kind === 'shop-slot') return false;
  if (kind === 'event') return false;
  if (kind === 'npc') return scope !== undefined;
  return true;
};

export { isSeedLocation };
