/* @layer store-api @kind logic */
/** An item's rating totals after one player's rating changes: added, changed or removed.
 *  `previous` and `next` are that player's stars before and after, null for none. The sum,
 *  the count, the histogram and the score always move together. */
import type { Stars } from '../../../../shared/store/rating-types';
import type { ItemStats } from '../../../../shared/store/types';
import { weightedScore } from './score';

type RatingTotals = Pick<ItemStats, 'ratingSum' | 'ratingCount' | 'ratingHist' | 'score'>;

const moveHist = (hist: ItemStats['ratingHist'], previous: Stars | null, next: Stars | null): ItemStats['ratingHist'] => {
  const moved: ItemStats['ratingHist'] = [...hist];
  if (previous !== null) moved[previous - 1] = Math.max(0, moved[previous - 1] - 1);
  if (next !== null) moved[next - 1] += 1;
  return moved;
};

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

/** The same totals as Firestore field paths, so a rating never rewrites the install counts. */
const statsFields = (totals: RatingTotals): Record<string, unknown> => ({
  'stats.ratingSum': totals.ratingSum,
  'stats.ratingCount': totals.ratingCount,
  'stats.ratingHist': totals.ratingHist,
  'stats.score': totals.score,
});

export { statsAfter, statsFields };
export type { RatingTotals };
