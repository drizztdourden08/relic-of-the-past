/* @layer renderer-app @kind logic */
import type { EntityKind } from '@shared/game/data';
import { NO_RECOMMENDATIONS } from '../recommendations.constants';
import { recommendationStore } from './recommendation-store';
import { storeRecommendations } from './store-recommendations';

const refreshRecommendations = async (kind: EntityKind): Promise<void> => {
  recommendationStore.loading.add(kind);
  try {
    storeRecommendations(kind, await window.api.loadRecommendations(kind));
  } catch {
    storeRecommendations(kind, NO_RECOMMENDATIONS);
  } finally {
    recommendationStore.loading.delete(kind);
  }
};

export { refreshRecommendations };
