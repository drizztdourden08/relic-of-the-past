/* @layer renderer-app @kind logic */
import type { Recommendation } from '@shared/game/recommendations';
import { CONFIDENCE_RANK } from '../recommendations.constants';

const byConfidenceThenAge = (a: Recommendation, b: Recommendation): number =>
  CONFIDENCE_RANK[a.confidence] - CONFIDENCE_RANK[b.confidence] || a.firstSeenAt - b.firstSeenAt;

export { byConfidenceThenAge };
