/* @layer store-site @kind component */
import { Chip } from '@site-kit/components/Chip/Chip';
import type { ReviewChipProps } from './ReviewChip.type';
import { REVIEW_LABELS, REVIEW_TONES } from './ReviewChip.constants';

const ReviewChip = (props: ReviewChipProps) => {
  const { state } = props;
  return <Chip tone={REVIEW_TONES[state]}>{REVIEW_LABELS[state]}</Chip>;
};

export { ReviewChip };
export type { ReviewChipProps, ReviewChipState } from './ReviewChip.type';
