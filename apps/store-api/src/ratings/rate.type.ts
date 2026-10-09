/* @layer store-api @kind types */
import type { Stars, ItemStats } from '@rotp/hub-contracts';

type RateResult = { stats: ItemStats; myRating: Stars | null };

export type { RateResult };
