/* @layer shared-game @kind logic */
import type { EntityKind, ScreenId } from '../../data/types';
import type { ScreenObservations } from '../detection-types';
import type { SetDifference } from './difference.type';
import type { SetProbe } from './probe.type';

const compareSet = <K extends EntityKind, Item>(
  probe: SetProbe<K, Item>,
  observations: ScreenObservations,
  screenId: ScreenId | null,
): readonly SetDifference<K, Item>[] => {
  const live = probe.readLive(observations, screenId);
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
    out.push(proposed === null
      ? { status: 'unresolvable', noun: probe.noun, key, item }
      : { status: 'missing-in-dataset', noun: probe.noun, key, proposed });
  }

  if (probe.removable) {
    for (const [key, record] of datasetByKey) {
      if (!liveKeys.has(key)) out.push({ status: 'unbacked-in-dataset', noun: probe.noun, key, record });
    }
  }

  return out;
};

export { compareSet };
