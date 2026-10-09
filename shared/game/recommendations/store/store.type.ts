/* @layer shared-game @kind types */
import type { EntityKind } from '../../data/types';
import type { Recommendation } from '../types';
import type { createRecommendationStore } from './create-recommendation-store';

interface RecommendationStorage {
  load: (kind: EntityKind) => Promise<readonly Recommendation[]>;
  save: (kind: EntityKind, entries: readonly Recommendation[]) => Promise<void>;
}

interface PassResult {
  kind: EntityKind;
  entries: readonly Recommendation[];
}

type RecommendationStore = ReturnType<typeof createRecommendationStore>;

export type { PassResult, RecommendationStorage, RecommendationStore };
