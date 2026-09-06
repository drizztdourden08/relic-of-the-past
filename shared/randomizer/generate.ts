/* @layer shared-game @kind logic */
/**
 * Generation entry points. generateFromSnapshot is the real generator: it
 * delegates to the ported reference pipeline (ap-world/fill/generate-ap)
 * whenever a frozen option snapshot is supplied. The legacy dataset-driven
 * pipeline below (pool -> dungeon prefill -> assumed fill -> junk fill ->
 * beatability) is kept compiling for its existing callers but is deprecated
 * and unused by new code.
 */
import { all } from '@shared/game/data';
import { generateApPlacement } from './ap-world/fill/generate-ap';
import type { RandomizerOptionsSnapshot } from './ap-world/options.type';
import type { ApPlacement } from './ap-world/fill/ap-placement.type';
import type { CheckId, ItemId } from '@shared/game/data';
import { OPEN_CONFIG } from '@shared/game/data/presets/open';
import { buildPool, classifyItem, dungeonLocalItems } from './pool';
import { createRng } from './rng';
import type { Placement, RandomizerOptions } from './placement.type';
import { DEFAULT_OPTIONS } from './placement.type';
import { verifyPlacement } from './beatability';
import { assumedFill, FillError } from './fill/assumed-fill';
import { prefillDungeonItems } from './fill/dungeon-prefill';
import { resolveFillRules } from './fill/fill-rules';
import { removeOnce } from './fill/remove-once';

const MAX_ATTEMPTS = 20;

/** Optional out-parameter: stamped with how the generation went (attempt count for retry telemetry). */
interface GenerateStats {
  attempts?: number;
}

const attemptGeneration = (seed: string, attemptSeed: string, options: RandomizerOptions): Placement => {
  const rng = createRng(attemptSeed);
  const { checks: poolChecks, poolItemIds } = buildPool(options);
  const rules = resolveFillRules(OPEN_CONFIG);
  const walkChecks = all('check');
  const randomizedIds = new Set<CheckId>(poolChecks.map((c) => c.id));

  const progression: ItemId[] = [];
  const junk: ItemId[] = [];
  for (const itemId of poolItemIds as ItemId[]) {
    (classifyItem(itemId) === 'junk' ? junk : progression).push(itemId);
  }

  const prefilled = prefillDungeonItems({
    localItems: dungeonLocalItems(poolChecks),
    checks: walkChecks,
    randomizedIds,
    progressionItemIds: progression,
    rules,
    rng,
  });

  const mainProgression = removeOnce(progression, [...prefilled.values()]);
  const placements = assumedFill({
    progressionItemIds: mainProgression,
    checks: walkChecks,
    rules,
    rng,
    preplaced: prefilled,
    randomizedIds,
  });

  const open = poolChecks.filter((c) => !placements.has(c.id));
  const shuffledJunk = rng.shuffle(junk);
  if (open.length !== shuffledJunk.length) {
    throw new Error(`junk fill imbalance: ${open.length} open checks vs ${shuffledJunk.length} junk items`);
  }
  open.forEach((check, i) => placements.set(check.id, shuffledJunk[i]));

  const { beatable, spheres, unreached } = verifyPlacement(placements, walkChecks, rules);
  if (!beatable) throw new FillError(placements.get(unreached[0] as CheckId) ?? 'item-none', placements.size);

  return {
    version: 1,
    seed,
    options,
    assignments: Object.fromEntries(placements),
    nameView: {},
    spoiler: spheres,
  };
};

/**
 * The snapshot-driven entry: the ported reference pipeline. The optional
 * sets name the npc-scope locations and capacity slots the app proved
 * physically deliverable; with the matching option on, only those shuffle
 * and the rest stay locked vanilla (absent counts as empty, so library
 * callers always get valid seeds).
 */
const generateFromSnapshot = (
  seed: string, snapshot: RandomizerOptionsSnapshot, deliverableNpcLocations?: ReadonlySet<string>,
  deliverableCapacityLocations?: ReadonlySet<string>,
  deliverableWorldLocations?: ReadonlySet<string>,
): ApPlacement =>
  generateApPlacement(seed, snapshot, deliverableNpcLocations, deliverableCapacityLocations,
    deliverableWorldLocations);

/** @deprecated Legacy dataset-driven facade, use generateFromSnapshot. */
const generatePlacement = (seed: string, options: RandomizerOptions = DEFAULT_OPTIONS, stats?: GenerateStats): Placement => {
  let lastMessage = '';
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const attemptSeed = attempt === 0 ? seed : `${seed}#retry${attempt}`;
    try {
      const placement = attemptGeneration(seed, attemptSeed, options);
      if (stats) stats.attempts = attempt + 1;
      return placement;
    } catch (error) {
      if (!(error instanceof FillError)) throw error;
      lastMessage = error.message;
    }
  }
  throw new Error(`placement generation failed for seed "${seed}" after ${MAX_ATTEMPTS} attempts, last failure: ${lastMessage}`);
};

export { generateFromSnapshot, generatePlacement, MAX_ATTEMPTS };
export type { GenerateStats };
