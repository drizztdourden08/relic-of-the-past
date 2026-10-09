/* @layer store-api @kind logic */
import type { Stars } from '@rotp/hub-contracts';
import { weightedScore } from '../score';
import { moveHist } from './move-hist';
import type { RatingTotals } from './stats-after.type';

const statsAfter = (stats: RatingTotals, previous: Stars | null, next: Stars | null): RatingTotals => {
  const ratingSum = Math.max(0, stats.ratingSum - (previous ?? 0) + (next ?? 0));
  const ratingCount = Math.max(0, stats.ratingCount - (previous === null ? 0 : 1) + (next === null ? 0 : 1));
  return {
    ratingSum,
    ratingCount,
    ratingHist: moveHist(stats.ratingHist, previous, next),
    score: ratingCount > 0 ? weightedScore(ratingSum, ratingCount) : 0,
  };
};

export { statsAfter };
