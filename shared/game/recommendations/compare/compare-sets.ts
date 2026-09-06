/* @layer shared-game @kind logic */
/** Joins a live collection against its dataset counterpart by key, for any enumerable collection through one `SetProbe`. */
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
  // Not read this pass, so stay silent. It does not mean the collection is empty.
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
    // whose destination has no screen). It survives as its own status, carrying
    // the original `item` so a strategy's `onUnresolvable` mapper can act on it.
    out.push(proposed === null
      ? { status: 'unresolvable', noun: probe.noun, key, item }
      : { status: 'missing-in-dataset', noun: probe.noun, key, proposed });
  }

  // A flood-backed (non-enumerable) set only proves what IS reachable, never
  // that a record is gone, so only a `removable` probe may report an unmatched record.
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
