/* @layer store-site @kind constants */
import { defineStatuses } from '@drizztdourden08/tessera/primitives';
import type { ReviewChipState } from './ReviewChip.type';

const REVIEW_STATUSES = defineStatuses({
  uploading: { label: 'uploading', tone: 'neutral' },
  ready: { label: 'ready', tone: 'info' },
  waiting: { label: 'waiting', tone: 'warning' },
  approved: { label: 'approved', tone: 'success' },
  rejected: { label: 'rejected', tone: 'danger' },
  deleted: { label: 'deleted', tone: 'neutral' },
  withdrawn: { label: 'withdrawn', tone: 'neutral' },
  expired: { label: 'expired', tone: 'neutral' },
}) satisfies Record<ReviewChipState, unknown>;

export { REVIEW_STATUSES };
