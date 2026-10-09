/* @layer renderer-app @kind logic */
import type { Recommendation } from '@shared/game/recommendations';
import { ensureRecommendationsLoaded } from './ensure-recommendations-loaded';
import { recommendationStore } from './recommendation-store';

const allRecommendations = (): readonly Recommendation[] => {
  ensureRecommendationsLoaded();
  return recommendationStore.flattened;
};

export { allRecommendations };
