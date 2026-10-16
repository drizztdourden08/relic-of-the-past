/* @layer renderer-app @kind logic */
import { ENTITY_KINDS } from '@app/views/DataInspector/DataInspector.constants';
import { ensureRecommendationsLoaded } from './ensure-recommendations-loaded';
import { recommendationStore } from './recommendation-store';

const recommendationsReady = (): boolean => {
  ensureRecommendationsLoaded();
  return ENTITY_KINDS.every(kind => recommendationStore.cache.has(kind));
};

export { recommendationsReady };
