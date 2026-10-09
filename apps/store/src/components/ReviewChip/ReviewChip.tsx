/* @layer store-site @kind component */
import { Status } from '@drizztdourden08/tessera/primitives';
import type { ReviewChipProps } from './ReviewChip.type';
import { REVIEW_STATUSES } from './ReviewChip.constants';

const ReviewChip = (props: ReviewChipProps) => {
  const { state } = props;
  return <Status variant="pill" map={REVIEW_STATUSES} value={state} />;
};

export { ReviewChip };
export type { ReviewChipProps, ReviewChipState } from './ReviewChip.type';
