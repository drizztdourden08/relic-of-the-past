/* @layer shared-game @kind logic */
/**
 * Runs one strategy's field probes over its subjects for one screen.
 *
 * This is the field half of the engine (`compare-sets.ts` is the collection
 * half): for every subject record, every probe either stays silent (does not
 * apply, was not read, or agrees) or produces one `Difference`. It never
 * decides what to DO about a difference. `detector-from-strategy.ts` turns
 * these into drafts, so this file has no opinion about recommendations at all.
 */
import type { EntityKind, EntityRecordMap, ScreenId } from '../../data/types';
import type { ScreenObservations } from '../detection-types';
import { deepEqual } from './deep-equal';
import { isAbsent, defaultFormat } from './probe-helpers';
import type { ComparisonStrategy, FieldProbe } from './probe.types';
import { getPath } from './set-path';
import type { Difference, DifferenceStatus, SubjectComparison } from './difference.types';

/**
 * `hasDataset`/`hasLive` are "is there a value to report", not "is it
 * truthy". An absent value is what `isAbsent` already normalizes away before
 * this runs, so by the time `classify` sees a `false`, that side really
 * has nothing.
 */
const classify = (hasDataset: boolean, hasLive: boolean): DifferenceStatus | null => {
  if (hasDataset && hasLive) return 'mismatch';
  if (hasLive) return 'missing-in-dataset';
  if (hasDataset) return 'unbacked-in-dataset';
  return null;
};

const compareField = <K extends EntityKind>(
  probe: FieldProbe<K>,
  record: EntityRecordMap[K],
  observations: ScreenObservations,
): Difference | null => {
  if (probe.applies && !probe.applies(observations, record)) return null;

  const reading = probe.read(observations, record);
  // An unread table proves nothing either way, so stay silent instead of
  // guessing at what the game would have said.
  if (!reading.known) return null;

  const datasetValue = getPath(record, probe.path);
  const liveValue = reading.value;
  if (deepEqual(datasetValue, liveValue)) return null;

  const status = classify(!isAbsent(datasetValue), !isAbsent(liveValue));
  if (!status) return null;

  const format = probe.format ?? defaultFormat;
  return {
    path: probe.path,
    label: probe.label,
    status,
    datasetValue,
    liveValue,
    shown: { dataset: format(datasetValue), live: format(liveValue) },
    source: probe.source,
    confidence: probe.confidence,
  };
};

const runComparison = <K extends EntityKind>(
  strategy: ComparisonStrategy<K>,
  observations: ScreenObservations,
  screenId: ScreenId | null,
): readonly SubjectComparison<K>[] => {
  const subjects = strategy.subjects(observations, screenId);
  return subjects.map(record => ({
    record,
    differences: strategy.fields
      .map(probe => compareField(probe, record, observations))
      .filter((difference): difference is Difference => difference !== null),
  }));
};

export { classify, compareField, runComparison };
