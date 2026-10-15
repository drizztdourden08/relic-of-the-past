/* @layer shared-game @kind types */
import type { EntityKind, EntityRecordMap } from '@rotp/game-data';
import type { Confidence, ProposedRecord } from '../types';

type DifferenceStatus = 'mismatch' | 'missing-in-dataset' | 'unbacked-in-dataset';

interface Difference {
  path: string;
  label: string;
  status: DifferenceStatus;
  datasetValue: unknown;
  liveValue: unknown;
  shown: { dataset: string; live: string };
  source: string;
  confidence: Confidence;
}

type SetDifference<K extends EntityKind, Item = unknown> =
  | { status: 'missing-in-dataset'; noun: string; key: string; proposed: ProposedRecord<K> }
  | { status: 'unbacked-in-dataset'; noun: string; key: string; record: EntityRecordMap[K] }
  | { status: 'unresolvable'; noun: string; key: string; item: Item };

interface SubjectComparison<K extends EntityKind> {
  record: EntityRecordMap[K];
  differences: readonly Difference[];
}

export type { Difference, DifferenceStatus, SetDifference, SubjectComparison };
