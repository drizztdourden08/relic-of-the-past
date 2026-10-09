/* @layer store-api @kind types */
import type { Stars } from '@rotp/hub-contracts';
import type { ItemStats } from '@rotp/hub-contracts';

type RateResult = { stats: ItemStats; myRating: Stars | null };

export type { RateResult };
