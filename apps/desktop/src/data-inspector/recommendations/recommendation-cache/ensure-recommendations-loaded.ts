/* @layer renderer-app @kind logic */
import { ENTITY_KINDS } from '@app/views/DataInspector/DataInspector.constants';
import { recommendationStore } from './recommendation-store';
import { refreshRecommendations } from './refresh-recommendations';

const ensureRecommendationsLoaded = (): void => {
  for (const kind of ENTITY_KINDS) {
    if (recommendationStore.cache.has(kind) || recommendationStore.loading.has(kind)) continue;
    void refreshRecommendations(kind);
  }
};

export { ensureRecommendationsLoaded };
