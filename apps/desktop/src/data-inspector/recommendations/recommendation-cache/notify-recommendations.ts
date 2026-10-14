/* @layer renderer-app @kind logic */
import { ENTITY_KINDS } from '@app/views/DataInspector/DataInspector.constants';
import { NO_RECOMMENDATIONS } from '../recommendations.constants';
import { recommendationStore } from './recommendation-store';

const notifyRecommendations = (): void => {
  recommendationStore.flattened = ENTITY_KINDS.flatMap(kind => recommendationStore.cache.get(kind) ?? NO_RECOMMENDATIONS);
  for (const listener of recommendationStore.listeners) listener();
};

export { notifyRecommendations };
