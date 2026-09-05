/* @layer shared-game @kind types */
/**
 * A PROBE reads one live value or one live set; a STRATEGY bundles the probes
 * that describe one entity kind. A strategy only DECLARES what to read;
 * `run-comparison.ts` and `compare-sets.ts` own the walk, the classification
 * and the formatting once, for every kind.
 */
import type { EntityKind, EntityRecordMap, ScreenId } from '../../data/types';
import type { ScreenObservations } from '../detection-types';
import type { Confidence, ProposedRecord } from '../types';

/**
 * A live reading. `known: false` means the table backing it was NOT READ this
 * pass: silence, not a negative answer, so consumers treat it as "nothing to
 * say", never "confirmed absent". `known(undefined)` is a different thing (see `probe-helpers.ts`).
 */
type Probe<V> = { known: false } | { known: true; value: V };

/**
 * One field worth comparing on one record. `read` gets the observations AND the
 * record because some fields only make sense given what the record already
 * claims (an entrance-only field on a non-entrance screen); `applies` gates that.
 */
interface FieldProbe<K extends EntityKind> {
  /** Record path in `diff.ts` grammar, e.g. `gameId.roomIndex` or `tags[2]`. */
  path: string;
  label: string;
  read: (observations: ScreenObservations, record: EntityRecordMap[K]) => Probe<unknown>;
  /** Where the live value came from, e.g. `native:room-identity`. */
  source: string;
  confidence: Confidence;
  format?: (value: unknown) => string;
  applies?: (observations: ScreenObservations, record: EntityRecordMap[K]) => boolean;
}

/**
 * A whole COLLECTION worth comparing, e.g. every edge leaving a screen. A set
 * probe owns its own join: live items and dataset records are matched by key,
 * not by position, because nothing guarantees either side is ordered the same
 * way. Every function receives the current `screenId` so a crossing probe can
 * tell which endpoint of a `ConnectionRecord` is "here"; a probe that does not
 * need it declares one fewer parameter.
 */
interface SetProbe<K extends EntityKind, Item> {
  id: string;
  /** Singular noun for a finding's `key` and its reason text: 'edge', 'chest'. */
  noun: string;
  readLive: (observations: ScreenObservations, screenId: ScreenId | null) => Probe<readonly Item[]>;
  readDataset: (observations: ScreenObservations, screenId: ScreenId | null) => readonly EntityRecordMap[K][];
  liveKey: (item: Item) => string;
  datasetKey: (record: EntityRecordMap[K], screenId: ScreenId | null) => string;
  toProposed: (item: Item, observations: ScreenObservations, screenId: ScreenId | null) => ProposedRecord<K> | null;
  /**
   * True ONLY for an enumerable native table. The flood proves presence only,
   * so a flood-backed set must never propose a delete. Set this false and
   * `compareSet` will not report a dataset record the live read failed to match.
   */
  removable: boolean;
  source: string;
  confidence: Confidence;
}

/**
 * Everything needed to compare one entity kind against the live game; pure
 * declaration. `sets` erases each probe's `Item` to `any`: one strategy holds
 * probes for DIFFERENT collections with different item shapes, and
 * `SetProbe<K, unknown>` makes `liveKey`/`toProposed` uncallable without an
 * unsound cast. The `any` is contained: nothing here or in `compare-sets.ts`
 * inspects an `Item` beyond passing it through the same probe's own functions.
 */
interface ComparisonStrategy<K extends EntityKind> {
  kind: K;
  subjects: (observations: ScreenObservations, screenId: ScreenId | null) => readonly EntityRecordMap[K][];
  fields: readonly FieldProbe<K>[];
  // `no-explicit-any` is not active in this project's eslint config; the `any` is correct, see above.
  sets: readonly SetProbe<K, any>[];
}

export type { ComparisonStrategy, FieldProbe, Probe, SetProbe };
