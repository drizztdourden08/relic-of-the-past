/* @layer renderer-app @kind logic */
import type { EntityKind } from '@shared/game/data';
import type { DetectionContext, DraftRecommendation } from '@shared/game/recommendations';
import { storeRecommendations } from './store-recommendations';

const applyRecommendationPass = async (
  kind: EntityKind,
  context: DetectionContext,
  detectorIds: readonly string[],
  drafts: readonly DraftRecommendation[],
): Promise<void> => {
  const result = await window.api.applyRecommendationPass(kind, context, detectorIds, drafts);
  storeRecommendations(kind, result.entries);
};

export { applyRecommendationPass };
