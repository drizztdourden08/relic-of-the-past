/* @layer renderer-app @kind logic */
import { NO_RECOMMENDATIONS } from '../recommendations.constants';
import type { RecommendationStore } from '../recommendations.type';

const recommendationStore: RecommendationStore = {
  cache: new Map(),
  loading: new Set(),
  listeners: new Set(),
  flattened: NO_RECOMMENDATIONS,
};

export { recommendationStore };
