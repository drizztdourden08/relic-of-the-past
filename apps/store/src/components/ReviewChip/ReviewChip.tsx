/* @layer store-site @kind component */
/** Where a version or a listing edit stands in review, as the kit's pill in the state's tone. */
import type { ReviewState } from '@shared/store/review-types';
import { Chip } from '@site-kit/components/Chip/Chip';
import type { ChipTone } from '@site-kit/components/Chip/Chip';

type ReviewChipProps = { state: ReviewState };

const REVIEW_TONES: Record<ReviewState, ChipTone> = {
  uploading: 'muted',
  waiting: 'warning',
  approved: 'green',
  rejected: 'danger',
  withdrawn: 'muted',
};

const REVIEW_LABELS: Record<ReviewState, string> = {
  uploading: 'uploading',
  waiting: 'waiting',
  approved: 'approved',
  rejected: 'rejected',
  withdrawn: 'withdrawn',
};

const ReviewChip = (props: ReviewChipProps) => {
  const { state } = props;
  return <Chip tone={REVIEW_TONES[state]}>{REVIEW_LABELS[state]}</Chip>;
};

export { ReviewChip, REVIEW_LABELS };
export type { ReviewChipProps };
