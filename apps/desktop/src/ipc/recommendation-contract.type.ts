/* @layer shared-ipc @kind types */
import type { EntityKind } from '@rotp/game-data';
import type { DetectionContext, DraftRecommendation } from '@rotp/navigation';

type RecommendationPassRequest = {
  kind: EntityKind;
  context: DetectionContext;
  detectorIds: readonly string[];
  drafts: readonly DraftRecommendation[];
};

export type { RecommendationPassRequest };
export type { PassResult, Recommendation } from '@rotp/navigation';
