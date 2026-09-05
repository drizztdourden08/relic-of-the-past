/* @layer shared-game @kind types */
/**
 * The one shape every "the dataset disagrees with the live game" finding takes.
 * A recommendation carries a RECORD, the thing the dataset would hold if the
 * finding were applied, never pre-rendered text: a writer cannot check text, a
 * diff cannot align it, and a user cannot accept it in bulk.
 */
import type { EntityKind, EntityRecordMap, ScreenId } from '../data/types';

/** Every record kind declares an `id`, so its id type is readable off the map. */
type EntityIdOf<K extends EntityKind> = EntityRecordMap[K]['id'];

/**
 * The record a finding proposes. A `create` has no id yet (ids are minted by
 * the main-process allocator; nothing else may invent one), so the id is absent
 * for that action and present for every other, mirroring `PendingConnectionRecord`.
 */
type ProposedRecord<K extends EntityKind> = EntityRecordMap[K] | Omit<EntityRecordMap[K], 'id'>;

/** One thing a detector actually looked at, quoted so a reviewer can re-check it. */
interface Evidence {
  /** Where the fact came from: a native table, the flood, the dataset itself. */
  source: string;
  detail: string;
}

/**
 * How sure a detector is that its finding is real. A property of the evidence:
 * the native room tables are fully enumerable for the loaded room, so an
 * ABSENCE in them is provable (`certain`). The flood fill only proves presence
 * (what is reachable from where the player stands), so anything inferred from
 * reachability is `likely`, never `certain`. Batch-accept is gated on `certain`,
 * so getting this wrong makes it unsafe.
 */
type Confidence = 'certain' | 'likely';

type RecommendationAction = 'create' | 'update' | 'delete';

/**
 * `accepted` and `dismissed` are decisions a person made; `open` and `resolved`
 * are states the detection pass owns. Reconciliation never overwrites a decision.
 */
type RecommendationState = 'open' | 'accepted' | 'dismissed' | 'resolved';

/** Whether the finding came from the live game or from a recorded run. */
type RecommendationOrigin = 'live' | 'simulation';

interface Recommendation<K extends EntityKind = EntityKind> {
  /** Derived from content, never from a counter (see `recommendationId`), so a
   *  re-detection collapses onto the existing entry and a dismissal survives it. */
  id: string;
  kind: K;
  action: RecommendationAction;
  /** Null only for `create`, when there is no record to point at yet. */
  targetId: EntityIdOf<K> | null;
  /** Null only for `create`, when nothing is being replaced. */
  current: EntityRecordMap[K] | null;
  proposed: ProposedRecord<K>;
  reason: string;
  /** The `RecommendationDetector.id` that produced it. */
  detector: string;
  evidence: readonly Evidence[];
  confidence: Confidence;
  screenId: ScreenId | null;
  origin: RecommendationOrigin;
  state: RecommendationState;
  firstSeenAt: number;
  decidedAt: number | null;
}

/**
 * What a detector emits. Identity and lifecycle are not its business: the
 * registry derives the id and the store owns the state and the timestamps.
 */
type DraftRecommendation<K extends EntityKind = EntityKind> =
  Omit<Recommendation<K>, 'id' | 'state' | 'firstSeenAt' | 'decidedAt'> & {
    /**
     * The part of this finding's identity `targetId` and `screenId` do not carry
     * (a destination id, a field path). Required whenever one detector can emit
     * more than one finding for the same screen, which for a `create` is always.
     * Derive it from WHAT the finding is about, never from the proposed record's
     * contents: flood nav data shifts between passes and would mint a fresh id every time.
     */
    key?: string;
  };

export type {
  Confidence, DraftRecommendation, EntityIdOf, Evidence, ProposedRecord,
  Recommendation, RecommendationAction, RecommendationOrigin, RecommendationState,
};
