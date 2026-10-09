/* @layer renderer-app @kind logic */
import type { Recommendation } from '@shared/game/recommendations';
import { decideRecommendation } from '../recommendation-cache';

const dismissRecommendation = (entry: Recommendation): Promise<void> =>
  decideRecommendation(entry.kind, entry.id, 'dismissed');

export { dismissRecommendation };
