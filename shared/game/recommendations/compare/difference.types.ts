/* @layer shared-game @kind types */
/**
 * What `run-comparison.ts` and `compare-sets.ts` hand back: the OUTCOME of
 * checking one probe against the live game, before it becomes a recommendation.
 *
 * Kept separate from `probe.types.ts` because a probe describes how to look
 * and a difference describes what was found — a strategy author writes the
 * former, the engine produces the latter, and nothing else should need to
 * construct one by hand.
 */
import type { EntityKind, EntityRecordMap } from '../../data/types';
import type { Confidence, ProposedRecord } from '../types';

/**
 * `mismatch`: both sides have a value and they disagree.
 * `missing-in-dataset`: the game reports something the record does not hold.
 * `unbacked-in-dataset`: the record holds something the game does not confirm
 * — only ever reachable through a `removable` set probe; a field probe never
 * produces it, because a field always exists on the record once the record
 * exists (there is no "the dataset has no opinion on this field" for a field).
 */
type DifferenceStatus = 'mismatch' | 'missing-in-dataset' | 'unbacked-in-dataset';

/** One field where the record and the live game disagree, already formatted. */
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

/**
 * `unresolvable` covers a live item with no dataset match AND no way to
 * propose one (`toProposed` returned null — the live evidence alone cannot
 * be turned into a valid record, e.g. a crossing whose destination has no
 * screen of its own). It is the case `connection-audit-core.ts` used to drop
 * silently; here it survives as a distinct status instead of vanishing, and
 * carries the original live `item` so a strategy's `onUnresolvable` mapper
 * can act on it directly — the connection strategy's own mapper (phase 4,
 * part 2) reads a crossing's raw destination index straight off it to
 * propose the missing screen, rather than parsing one back out of `key`.
 */
type SetDifferenceStatus = 'missing-in-dataset' | 'unbacked-in-dataset' | 'unresolvable';

type SetDifference<K extends EntityKind, Item = unknown> =
  | { status: 'missing-in-dataset'; noun: string; key: string; proposed: ProposedRecord<K> }
  | { status: 'unbacked-in-dataset'; noun: string; key: string; record: EntityRecordMap[K] }
  | { status: 'unresolvable'; noun: string; key: string; item: Item };

/** One record plus everything the game disagrees with about it. */
interface SubjectComparison<K extends EntityKind> {
  record: EntityRecordMap[K];
  differences: readonly Difference[];
}

export type { Difference, DifferenceStatus, SetDifference, SetDifferenceStatus, SubjectComparison };
