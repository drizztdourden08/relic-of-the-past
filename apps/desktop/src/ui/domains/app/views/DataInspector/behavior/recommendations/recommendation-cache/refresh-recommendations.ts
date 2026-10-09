/* @layer renderer-app @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { EntityKind } from '@rotp/game-data';
import { NO_RECOMMENDATIONS } from '../recommendations.constants';
import { recommendationStore } from './recommendation-store';
import { storeRecommendations } from './store-recommendations';

const refreshRecommendations = async (kind: EntityKind): Promise<void> => {
  recommendationStore.loading.add(kind);
  try {
    storeRecommendations(kind, await appApi().loadRecommendations(kind));
  } catch {
    storeRecommendations(kind, NO_RECOMMENDATIONS);
  } finally {
    recommendationStore.loading.delete(kind);
  }
};

export { refreshRecommendations };
