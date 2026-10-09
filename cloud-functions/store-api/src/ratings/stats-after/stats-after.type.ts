/* @layer store-api @kind types */
import type { ItemStats } from '../../../../../shared/store/types';

type RatingTotals = Pick<ItemStats, 'ratingSum' | 'ratingCount' | 'ratingHist' | 'score'>;

export type { RatingTotals };
