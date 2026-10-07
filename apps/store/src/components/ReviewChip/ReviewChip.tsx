/* @layer store-site @kind component */
/**
 * Where a version or a listing edit stands in review, as the kit's pill in the state's tone.
 * Expired is a ready version whose file the store removed before it was sent.
 */
import type { ListingEditState, ReviewState } from '@shared/store/review-types';
import { Chip } from '@site-kit/components/Chip/Chip';
import type { ChipTone } from '@site-kit/components/Chip/Chip';

type ReviewChipState = ReviewState | ListingEditState | 'expired';

type ReviewChipProps = { state: ReviewChipState };

const REVIEW_TONES: Record<ReviewChipState, ChipTone> = {
  uploading: 'muted',
  ready: 'info',
  waiting: 'warning',
  approved: 'green',
  rejected: 'danger',
  deleted: 'muted',
  withdrawn: 'muted',
  expired: 'muted',
};

const REVIEW_LABELS: Record<ReviewChipState, string> = {
  uploading: 'uploading',
  ready: 'ready',
  waiting: 'waiting',
  approved: 'approved',
  rejected: 'rejected',
  deleted: 'deleted',
  withdrawn: 'withdrawn',
  expired: 'expired',
};

const ReviewChip = (props: ReviewChipProps) => {
  const { state } = props;
  return <Chip tone={REVIEW_TONES[state]}>{REVIEW_LABELS[state]}</Chip>;
};

export { ReviewChip, REVIEW_LABELS };
export type { ReviewChipProps, ReviewChipState };
