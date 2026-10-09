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

const REVIEW_LABELS: Record<ReviewChipState, string> = {
  uploading: REVIEW_STATUSES.uploading.label,
  ready: REVIEW_STATUSES.ready.label,
  waiting: REVIEW_STATUSES.waiting.label,
  approved: REVIEW_STATUSES.approved.label,
  rejected: REVIEW_STATUSES.rejected.label,
  deleted: REVIEW_STATUSES.deleted.label,
  withdrawn: REVIEW_STATUSES.withdrawn.label,
  expired: REVIEW_STATUSES.expired.label,
};

export { REVIEW_STATUSES, REVIEW_LABELS };
