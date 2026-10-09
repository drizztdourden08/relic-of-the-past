/* @layer store-api @kind types */
import type { Stars } from '../../../../shared/store/rating-types';
import type { ItemStats } from '../../../../shared/store/types';

type RateResult = { stats: ItemStats; myRating: Stars | null };

export type { RateResult };
