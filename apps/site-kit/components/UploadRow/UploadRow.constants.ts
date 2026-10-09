/* @layer site-kit @kind constants */
import type { ProgressTone } from '@drizztdourden08/tessera/primitives';
import type { ChipTone } from '../Chip/Chip.type';
import type { UploadPhase } from '../../upload/upload-job.type';

const PHASE_CHIPS: Record<UploadPhase, { label: string; tone: ChipTone }> = {
  queued: { label: 'queued', tone: 'muted' },
  hashing: { label: 'checking', tone: 'info' },
  uploading: { label: 'uploading', tone: 'gold' },
  verifying: { label: 'verifying', tone: 'info' },
  done: { label: 'done', tone: 'green' },
  failed: { label: 'failed', tone: 'danger' },
  'needs-file': { label: 'paused', tone: 'warning' },
};

const BAR_VARIANTS: Partial<Record<UploadPhase, ProgressTone>> = { done: 'green', failed: 'danger' };

export { PHASE_CHIPS, BAR_VARIANTS };
