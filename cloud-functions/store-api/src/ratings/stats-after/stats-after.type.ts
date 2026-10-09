/* @layer store-api @kind types */
import type { ItemStats } from '@rotp/hub-contracts';

type RatingTotals = Pick<ItemStats, 'ratingSum' | 'ratingCount' | 'ratingHist' | 'score'>;

export type { RatingTotals };
