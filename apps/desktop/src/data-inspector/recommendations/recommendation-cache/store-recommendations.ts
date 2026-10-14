/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { Recommendation } from '@rotp/navigation';
import { NO_RECOMMENDATIONS } from '../recommendations.constants';
import { notifyRecommendations } from './notify-recommendations';
import { recommendationStore } from './recommendation-store';

const storeRecommendations = (kind: EntityKind, entries: readonly Recommendation[] | null | undefined): void => {
  recommendationStore.cache.set(kind, entries ?? NO_RECOMMENDATIONS);
  notifyRecommendations();
};

export { storeRecommendations };
