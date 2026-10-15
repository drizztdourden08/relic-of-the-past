/* @layer shared-game @kind types */
import type { EntityKind } from '@rotp/game-data';
import type { DraftRecommendation, Recommendation } from '../types';

interface RecommendationStorage {
  load: (kind: EntityKind) => Promise<readonly Recommendation[]>;
  save: (kind: EntityKind, entries: readonly Recommendation[]) => Promise<void>;
}

interface PassResult {
  kind: EntityKind;
  entries: readonly Recommendation[];
}

interface DetectionPass {
  detectorIds: readonly string[];
  fresh: readonly DraftRecommendation[];
}

export type { DetectionPass, PassResult, RecommendationStorage };
