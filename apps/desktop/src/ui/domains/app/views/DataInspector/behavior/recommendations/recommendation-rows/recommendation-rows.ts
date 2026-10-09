/* @layer renderer-app @kind logic */
import type { Recommendation } from '@shared/game/recommendations';
import type { RecommendationRow } from '../recommendations.type';
import { byConfidenceThenAge } from './by-confidence-then-age';
import { openRecommendations } from './open-recommendations';
import { rowOf } from './row-of';

const recommendationRows = (entries: readonly Recommendation[]): readonly RecommendationRow[] =>
  [...openRecommendations(entries)].sort(byConfidenceThenAge).map(rowOf);

export { recommendationRows };
