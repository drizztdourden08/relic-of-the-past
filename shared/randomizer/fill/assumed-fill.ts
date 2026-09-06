/* @layer shared-game @kind logic */
/**
 * Classic assumed fill: place progression items one at a time, assuming every
 * still-unplaced progression item is owned, and restrict each placement to a
 * location that stays collectable under that assumption. Pure: all state
 * flows through the input and the returned map.
 */
import type { CheckId, CheckRecord, ItemId } from '@shared/game/data';
import type { ResolvedRules } from '@shared/game/logic/resolver';
import type { Rng } from '../rng';
import { sphereWalk } from './reachability';

class FillError extends Error {
  readonly itemId: ItemId;

  constructor(itemId: ItemId, placedCount: number) {
    super(`no reachable open location for ${itemId} (${placedCount} placed)`);
    this.name = 'FillError';
    this.itemId = itemId;
  }
}

interface AssumedFillInput {
  progressionItemIds: readonly ItemId[];
  /** Full walk list: reachability needs every check, not just the candidates. */
  checks: readonly CheckRecord[];
  rules: ResolvedRules;
  rng: Rng;
  preplaced: ReadonlyMap<CheckId, ItemId>;
  /** The randomized domain: an unassigned member grants nothing during the walk. */
  randomizedIds: ReadonlySet<CheckId>;
  /** Restricts placements to these check ids (dungeon prefill); all randomized checks otherwise. */
  candidateIds?: ReadonlySet<CheckId>;
  /** Items assumed owned throughout, on top of the still-unplaced ones (dungeon prefill). */
  assumedItemIds?: readonly ItemId[];
}

const assumedFill = (input: AssumedFillInput): Map<CheckId, ItemId> => {
  const { progressionItemIds, checks, rules, rng, preplaced, randomizedIds, candidateIds, assumedItemIds = [] } = input;
  const placements = new Map(preplaced);
  const remaining = rng.shuffle(progressionItemIds);

  while (remaining.length > 0) {
    const itemId = remaining.pop();
    if (itemId === undefined) break;

    const assumed = new Set<ItemId>([...remaining, ...assumedItemIds]);
    const walk = sphereWalk({ assignments: placements, checks, startInventory: assumed, rules, randomizedIds });

    const candidates = checks.filter((c) => randomizedIds.has(c.id)
      && !placements.has(c.id)
      && (candidateIds === undefined || candidateIds.has(c.id))
      && walk.completedChecks.has(c.id));
    if (candidates.length === 0) throw new FillError(itemId, placements.size);

    placements.set(candidates[rng.int(candidates.length)].id, itemId);
  }

  return placements;
};

export { assumedFill, FillError };
export type { AssumedFillInput };
