/* @layer renderer-app @kind logic */
import type { EntityKind } from '@shared/game/data';
import type { Recommendation } from '@shared/game/recommendations';
import { NO_RECOMMENDATIONS } from '../recommendations.constants';
import { notifyRecommendations } from './notify-recommendations';
import { recommendationStore } from './recommendation-store';

const storeRecommendations = (kind: EntityKind, entries: readonly Recommendation[] | null | undefined): void => {
  recommendationStore.cache.set(kind, entries ?? NO_RECOMMENDATIONS);
  notifyRecommendations();
};

export { storeRecommendations };
