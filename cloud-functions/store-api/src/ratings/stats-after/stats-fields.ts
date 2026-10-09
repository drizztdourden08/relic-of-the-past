/* @layer store-api @kind logic */
import type { RatingTotals } from './stats-after.type';

const statsFields = (totals: RatingTotals): Record<string, unknown> => ({
  'stats.ratingSum': totals.ratingSum,
  'stats.ratingCount': totals.ratingCount,
  'stats.ratingHist': totals.ratingHist,
  'stats.score': totals.score,
});

export { statsFields };
