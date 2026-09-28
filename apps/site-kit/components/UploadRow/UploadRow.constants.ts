/* @layer site-kit @kind constants */
import type { ProgressVariant } from '@ds/primitives/ProgressBar';
import type { ChipTone } from '../Chip/Chip';
import type { UploadPhase } from '../../upload/upload-job.type';

/** The chip each phase shows in a tray row; a job waiting for its file reads as paused. */
const PHASE_CHIPS: Record<UploadPhase, { label: string; tone: ChipTone }> = {
  queued: { label: 'queued', tone: 'muted' },
  hashing: { label: 'checking', tone: 'info' },
  uploading: { label: 'uploading', tone: 'gold' },
  verifying: { label: 'verifying', tone: 'info' },
  done: { label: 'done', tone: 'green' },
  failed: { label: 'failed', tone: 'danger' },
  'needs-file': { label: 'paused', tone: 'warning' },
};

const BAR_VARIANTS: Partial<Record<UploadPhase, ProgressVariant>> = { done: 'green', failed: 'danger' };

export { PHASE_CHIPS, BAR_VARIANTS };
