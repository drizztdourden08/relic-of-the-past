/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import type { EntityKind } from '@rotp/game-data';
import type { DetectionContext, DraftRecommendation } from '@rotp/navigation';
import { storeRecommendations } from './store-recommendations';

const applyRecommendationPass = async (
  kind: EntityKind,
  context: DetectionContext,
  detectorIds: readonly string[],
  drafts: readonly DraftRecommendation[],
): Promise<void> => {
  const result = await requireHostApi().applyRecommendationPass(kind, context, detectorIds, drafts);
  storeRecommendations(kind, result.entries);
};

export { applyRecommendationPass };
