/* @layer renderer-app @kind logic */
import { notifyRecommendations } from './notify-recommendations';
import { recommendationStore } from './recommendation-store';

const clearRecommendationCache = (): void => {
  recommendationStore.cache.clear();
  recommendationStore.loading.clear();
  notifyRecommendations();
};

export { clearRecommendationCache };
