/* @layer shared-game @kind logic */
import type { EntityKind, EntityRecordMap } from '@rotp/game-data';
import type { ScreenObservations } from '../detection-types';
import { classify } from './classify';
import { deepEqual } from './deep-equal';
import type { Difference } from './difference.type';
import { isAbsent } from './probe-reading';
import type { FieldProbe } from './probe.type';
import { defaultFormat } from './value-format';
import { getPath } from './record-path';

const compareField = <K extends EntityKind>(
  probe: FieldProbe<K>,
  record: EntityRecordMap[K],
  observations: ScreenObservations,
): Difference | null => {
  if (probe.applies && !probe.applies(observations, record)) return null;

  const reading = probe.read(observations, record);
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

export { compareField };
