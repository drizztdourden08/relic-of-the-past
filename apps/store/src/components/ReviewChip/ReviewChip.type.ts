/* @layer store-site @kind types */
import type { ListingEditState, ReviewState } from '@rotp/hub-contracts';

type ReviewChipState = ReviewState | ListingEditState | 'expired';

type ReviewChipProps = { state: ReviewChipState };

export type { ReviewChipProps, ReviewChipState };
