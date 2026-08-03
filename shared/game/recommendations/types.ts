/* @layer shared-game @kind types */
/**
 * The one shape every "the dataset disagrees with the live game" finding takes.
 *
 * Before this existed, eight separate mechanisms each invented their own output:
 * a `{field,message,suggestedValue}` triple nobody read, two flavours of
 * suggestion carrying pre-rendered SOURCE TEXT, a bare array of warning strings,
 * and a label-only parity report whose ids had already been thrown away. Text is
 * not actionable — a writer cannot check it, a diff cannot align it, and a user
 * cannot accept it in bulk. So a recommendation carries a RECORD: the thing the
 * dataset would hold if the finding were applied.
 */
import type { EntityKind, EntityRecordMap, ScreenId } from '../data/types';

/** Every record kind declares an `id`, so its id type is readable off the map. */
type EntityIdOf<K extends EntityKind> = EntityRecordMap[K]['id'];

/**
 * The record a finding proposes.
 *
 * A `create` has no id yet — ids are minted by the main-process allocator, and
 * nothing in this codebase is allowed to invent one — so the id is absent for
 * that action and present for every other. This mirrors `PendingConnectionRecord`
 * on the writer side, which is exactly what an insert payload wants.
 */
type ProposedRecord<K extends EntityKind> = EntityRecordMap[K] | Omit<EntityRecordMap[K], 'id'>;

/** One thing a detector actually looked at, quoted so a reviewer can re-check it. */
interface Evidence {
  /** Where the fact came from: a native table, the flood, the dataset itself. */
  source: string;
  detail: string;
}

/**
 * How sure a detector is that its finding is real — and NOT cosmetic.
 *
 * The distinction is a property of the evidence, not of the detector's mood.
 * The native room tables (stairs, walk boundaries, travel, exits, entrances,
 * holes, doors, chests, sprite spawns, room tags) are fully enumerable for the
 * loaded room, so an ABSENCE in them is provable: `certain`. The flood fill only
 * ever proves presence — it sees what is reachable from where the player happens
 * to stand — so anything inferred from reachability is `likely`, never `certain`.
 * That asymmetry is why the connection audit refuses to propose removing a
 * `kind: 'edge'` connection, and every detector reasons the same way.
 *
 * Batch-accept is gated on `certain`, so getting this wrong makes it unsafe.
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
  /**
   * Derived from content, never from a counter — see `recommendationId`. Two
   * passes that find the same thing mint the same id, which is what lets a
   * re-detection collapse onto the existing entry instead of duplicating it, and
   * what lets a dismissal survive being detected again.
   */
  id: string;
  kind: K;
  action: RecommendationAction;
  /** Null only for `create` — there is no record to point at yet. */
  targetId: EntityIdOf<K> | null;
  /** Null only for `create` — nothing is being replaced. */
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
     * The part of this finding's identity that `targetId` and `screenId` do not
     * already carry — a destination id for a proposed connection, a field path
     * for a screen fix. Required whenever one detector can emit more than one
     * finding for the same screen, which for a `create` is always.
     *
     * It must be derived from WHAT the finding is about, never from the proposed
     * record's contents: nav data attached from the flood shifts between passes,
     * and hashing it would mint a fresh id every time and defeat reconciliation.
     */
    key?: string;
  };

export type {
  Confidence, DraftRecommendation, EntityIdOf, Evidence, ProposedRecord,
  Recommendation, RecommendationAction, RecommendationOrigin, RecommendationState,
};
