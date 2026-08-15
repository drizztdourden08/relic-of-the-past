/* @layer shared-game @kind types */
/**
 * The vocabulary a comparison strategy speaks in: a PROBE reads one live value
 * or one live set, a STRATEGY bundles the probes that describe one entity kind.
 *
 * This exists to stop the copy-paste that produced the detector sprawl this
 * module replaces: every one of those detectors re-derived "read the game,
 * read the record, compare, format, decide confidence" by hand, and each copy
 * drifted a little from the others. A strategy instead DECLARES what to read
 * and how to read it; `run-comparison.ts` and `compare-sets.ts` own the walk,
 * the classification and the formatting once, for every kind.
 */
import type { EntityKind, EntityRecordMap, ScreenId } from '../../data/types';
import type { ScreenObservations } from '../detection-types';
import type { Confidence, ProposedRecord } from '../types';

/**
 * A live reading. `known: false` means the table backing it was NOT READ this
 * pass — silence, not a negative answer — and every consumer of a probe must
 * treat that case as "nothing to say" rather than "confirmed absent". See
 * `probe-helpers.ts` for why `known(undefined)` is a different thing entirely.
 */
type Probe<V> = { known: false } | { known: true; value: V };

/**
 * One field worth comparing on one record. `read` is handed the observations
 * AND the record, because some fields only make sense conditionally on what
 * the record already claims (an entrance-only field on a screen that is not
 * an entrance, say) — that is what `applies` gates.
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
 * A whole COLLECTION worth comparing, e.g. every edge leaving a screen. Unlike
 * a `FieldProbe`, a set probe owns its own join: live items and dataset
 * records are matched by key rather than by position, because nothing
 * guarantees either side is ordered the same way.
 *
 * Every function below also receives the current `screenId` (mirroring
 * `ComparisonStrategy.subjects`, which already does) — added for the
 * connection strategy's crossing probes, which need to know which of a
 * two-endpoint `ConnectionRecord` is "here" to key and filter correctly. A
 * probe that does not need it (e.g. `presence.set.ts`, which operates on the
 * single "current screen" identity already carried in `observations`) simply
 * declares one fewer parameter; TypeScript allows that directly, no cast.
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
   * so a flood-backed set must never propose a delete — set this false and
   * `compareSet` will not report a dataset record the live read failed to
   * match, exactly like the existing `kind: 'edge'` carve-out it replaces.
   */
  removable: boolean;
  source: string;
  confidence: Confidence;
  /**
   * Grade for an `unbacked-in-dataset` finding, when a removal deserves a
   * different one from an addition. A delete is a proof of ABSENCE, and an
   * absence proof is only as strong as the enumeration behind it: a probe
   * whose live read can legitimately miss a crossing keeps its deletes below
   * `certain`, so a gap in the enumeration is never batch-writable.
   */
  removalConfidence?: Confidence;
}

/**
 * Everything needed to compare one entity kind against the live game. A
 * strategy is pure declaration: no reading, no writing, just what to look at
 * and how to grade what it finds.
 *
 * `sets` erases each probe's `Item` type to `any`. A strategy over one kind
 * holds probes for DIFFERENT collections (edges, chests, spawns, ...), each
 * with its own item shape, so there is no single `Item` the array could carry
 * — and `SetProbe<K, unknown>` does not work either, because `unknown` makes
 * `liveKey`/`toProposed` uncallable without an unsound cast at the call site.
 * `any` here is contained: nothing in this file or `compare-sets.ts` inspects
 * a probe's `Item` beyond passing it straight through the same probe's own
 * functions, so the erasure never leaks into a genuinely unsound read.
 */
interface ComparisonStrategy<K extends EntityKind> {
  kind: K;
  subjects: (observations: ScreenObservations, screenId: ScreenId | null) => readonly EntityRecordMap[K][];
  fields: readonly FieldProbe<K>[];
  // NOTE: `no-explicit-any` is not an active rule in this project's eslint config
  // (confirmed empirically), so no suppression comment is needed for the `any`
  // below. It stays because it is CORRECT, not because it is unchecked: see the
  // paragraph above for why no narrower type expresses this.
  sets: readonly SetProbe<K, any>[];
}

export type { ComparisonStrategy, FieldProbe, Probe, SetProbe };
