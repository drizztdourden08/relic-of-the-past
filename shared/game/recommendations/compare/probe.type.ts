/* @layer shared-game @kind types */
import type { EntityKind, EntityRecordMap, ScreenId } from '@rotp/game-data';
import type { ScreenObservations } from '../detection-types';
import type { Confidence, ProposedRecord } from '../types';

type Probe<V> = { known: false } | { known: true; value: V };

interface FieldProbe<K extends EntityKind> {
  path: string;
  label: string;
  read: (observations: ScreenObservations, record: EntityRecordMap[K]) => Probe<unknown>;
  source: string;
  confidence: Confidence;
  format?: (value: unknown) => string;
  applies?: (observations: ScreenObservations, record: EntityRecordMap[K]) => boolean;
}

interface SetProbe<K extends EntityKind, Item> {
  id: string;
  noun: string;
  readLive: (observations: ScreenObservations, screenId: ScreenId | null) => Probe<readonly Item[]>;
  readDataset: (observations: ScreenObservations, screenId: ScreenId | null) => readonly EntityRecordMap[K][];
  liveKey: (item: Item) => string;
  datasetKey: (record: EntityRecordMap[K], screenId: ScreenId | null) => string;
  toProposed: (item: Item, observations: ScreenObservations, screenId: ScreenId | null) => ProposedRecord<K> | null;
  removable: boolean;
  source: string;
  confidence: Confidence;
  removalConfidence?: Confidence;
}

interface ComparisonStrategy<K extends EntityKind> {
  kind: K;
  subjects: (observations: ScreenObservations, screenId: ScreenId | null) => readonly EntityRecordMap[K][];
  fields: readonly FieldProbe<K>[];
  sets: readonly SetProbe<K, any>[];
}

export type { ComparisonStrategy, FieldProbe, Probe, SetProbe };
