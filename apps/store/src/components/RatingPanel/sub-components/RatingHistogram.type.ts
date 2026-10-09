/* @layer store-site @kind types */
import type { ItemStats } from '@rotp/hub-contracts';

type RatingHistogramProps = { hist: ItemStats['ratingHist'] };

export type { RatingHistogramProps };
