/* @layer shared-game @kind types */
import type { EntityKind, EntityRecordMap, ScreenId } from '@rotp/game-data';

type EntityIdOf<K extends EntityKind> = EntityRecordMap[K]['id'];

type ProposedRecord<K extends EntityKind> = EntityRecordMap[K] | Omit<EntityRecordMap[K], 'id'>;

interface Evidence {
  source: string;
  detail: string;
}

type Confidence = 'certain' | 'likely';

type RecommendationAction = 'create' | 'update' | 'delete';

type RecommendationState = 'open' | 'accepted' | 'dismissed' | 'resolved';

type RecommendationOrigin = 'live' | 'simulation';

interface Recommendation<K extends EntityKind = EntityKind> {
  id: string;
  kind: K;
  action: RecommendationAction;
  targetId: EntityIdOf<K> | null;
  current: EntityRecordMap[K] | null;
  proposed: ProposedRecord<K>;
  reason: string;
  detector: string;
  evidence: readonly Evidence[];
  confidence: Confidence;
  screenId: ScreenId | null;
  origin: RecommendationOrigin;
  state: RecommendationState;
  firstSeenAt: number;
  decidedAt: number | null;
}

type DraftRecommendation<K extends EntityKind = EntityKind> =
  Omit<Recommendation<K>, 'id' | 'state' | 'firstSeenAt' | 'decidedAt'> & {
    key?: string;
  };

export type {
  Confidence,
  DraftRecommendation,
  ProposedRecord,
  Recommendation,
  RecommendationAction,
  RecommendationOrigin,
};
