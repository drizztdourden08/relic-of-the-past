/* @layer store-site @kind types */
import type { ListingEditState, ReviewState } from '@shared/store/review-types';

type ReviewChipState = ReviewState | ListingEditState | 'expired';

type ReviewChipProps = { state: ReviewChipState };

export type { ReviewChipProps, ReviewChipState };
