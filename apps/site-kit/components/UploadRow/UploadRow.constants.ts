/* @layer site-kit @kind constants */
import { defineStatuses } from '@drizztdourden08/tessera/primitives';
import type { ProgressTone } from '@drizztdourden08/tessera/primitives';
import type { UploadPhase } from '../../upload/upload-job.type';

const PHASE_STATUSES = defineStatuses({
  queued: { label: 'queued', tone: 'neutral' },
  hashing: { label: 'checking', tone: 'info' },
  uploading: { label: 'uploading', tone: 'primary' },
  verifying: { label: 'verifying', tone: 'info' },
  done: { label: 'done', tone: 'success' },
  failed: { label: 'failed', tone: 'danger' },
  'needs-file': { label: 'paused', tone: 'warning' },
}) satisfies Record<UploadPhase, unknown>;

const BAR_VARIANTS: Partial<Record<UploadPhase, ProgressTone>> = { done: 'success', failed: 'danger' };

export { PHASE_STATUSES, BAR_VARIANTS };
