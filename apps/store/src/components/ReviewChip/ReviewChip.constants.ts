/* @layer store-site @kind constants */
import type { ChipTone } from '@site-kit/components/Chip/Chip';
import type { ReviewChipState } from './ReviewChip.type';

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

export { REVIEW_TONES, REVIEW_LABELS };
