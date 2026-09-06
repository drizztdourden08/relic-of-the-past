/* @layer shared-game @kind logic */
/**
 * Restrictive prefill for dungeon-bound items: each dungeon's local items are
 * assumed-filled into that dungeon's own checks only, with every OTHER
 * progression item assumed owned (the standard prefill assumption). Today's
 * dataset yields an empty local-item map, making this a no-op that activates
 * automatically once dungeon-bound item data lands.
 */
import type { CheckId, CheckRecord, ItemId } from '@shared/game/data';
import type { ResolvedRules } from '@shared/game/logic/resolver';
import type { Rng } from '../rng';
import { assumedFill } from './assumed-fill';
import { removeOnce } from './remove-once';

interface DungeonPrefillInput {
  /** DungeonId -> the items that must stay inside that dungeon. */
  localItems: ReadonlyMap<string, readonly string[]>;
  /** Full walk list — reachability needs every check. */
  checks: readonly CheckRecord[];
  /** The randomized domain (pool check ids). */
  randomizedIds: ReadonlySet<CheckId>;
  /** The complete progression pool — the assumed complement is derived from it. */
  progressionItemIds: readonly ItemId[];
  rules: ResolvedRules;
  rng: Rng;
}

const prefillDungeonItems = (input: DungeonPrefillInput): Map<CheckId, ItemId> => {
  const { localItems, checks, randomizedIds, progressionItemIds, rules, rng } = input;
  let placements = new Map<CheckId, ItemId>();

  for (const [dungeonId, items] of localItems) {
    const localItemIds = items as readonly ItemId[];
    const candidateIds = new Set<CheckId>(
      checks.filter((c) => randomizedIds.has(c.id) && c.dungeonId === dungeonId).map((c) => c.id),
    );
    const assumedItemIds = removeOnce(progressionItemIds, localItemIds);
    placements = assumedFill({
      progressionItemIds: localItemIds,
      checks,
      rules,
      rng,
      preplaced: placements,
      randomizedIds,
      candidateIds,
      assumedItemIds,
    });
  }

  return placements;
};

export { prefillDungeonItems };
export type { DungeonPrefillInput };
