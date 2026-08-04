/* @layer shared-game @kind logic */
/**
 * Joins a live collection against its dataset counterpart by key.
 *
 * This is the direct generalization of `connection-audit-core.ts`'s two
 * halves (`buildBadFindings` for the reverse direction, `buildAddFindings`
 * for the forward one), lifted out of connections specifically so any
 * enumerable collection — edges, entrances, chests, spawns — gets the same
 * treatment through one `SetProbe` instead of its own bespoke pair of
 * functions.
 */
import type { EntityKind, ScreenId } from '../../data/types';
import type { ScreenObservations } from '../detection-types';
import type { ComparisonStrategy, SetProbe } from './probe.types';
import type { SetDifference } from './difference.types';

const compareSet = <K extends EntityKind, Item>(
  probe: SetProbe<K, Item>,
  observations: ScreenObservations,
  screenId: ScreenId | null,
): readonly SetDifference<K, Item>[] => {
  const live = probe.readLive(observations, screenId);
  // Not read this pass — silence, not "the collection is empty".
  if (!live.known) return [];

  const dataset = probe.readDataset(observations, screenId);
  const datasetByKey = new Map(dataset.map(record => [probe.datasetKey(record, screenId), record]));
  const liveKeys = new Set<string>();

  const out: SetDifference<K, Item>[] = [];

  for (const item of live.value) {
    const key = probe.liveKey(item);
    liveKeys.add(key);
    if (datasetByKey.has(key)) continue;

    const proposed = probe.toProposed(item, observations, screenId);
    // The live evidence alone cannot become a valid record (e.g. a crossing
    // whose destination has no screen of its own). `connection-audit-core.ts`
    // used to drop this case silently — here it survives as its own status,
    // carrying the original `item` so a strategy's `onUnresolvable` mapper
    // can still act on it (see `difference.types.ts`).
    out.push(proposed === null
      ? { status: 'unresolvable', noun: probe.noun, key, item }
      : { status: 'missing-in-dataset', noun: probe.noun, key, proposed });
  }

  // A flood-backed (non-enumerable) set can never prove a record is gone —
  // it only ever proves what IS reachable — so only a `removable` probe may
  // report an unmatched dataset record.
  if (probe.removable) {
    for (const [key, record] of datasetByKey) {
      if (!liveKeys.has(key)) out.push({ status: 'unbacked-in-dataset', noun: probe.noun, key, record });
    }
  }

  return out;
};

const compareSets = <K extends EntityKind>(
  strategy: ComparisonStrategy<K>,
  observations: ScreenObservations,
  screenId: ScreenId | null,
): readonly SetDifference<K>[] => strategy.sets.flatMap(probe => compareSet(probe, observations, screenId));

export { compareSet, compareSets };
