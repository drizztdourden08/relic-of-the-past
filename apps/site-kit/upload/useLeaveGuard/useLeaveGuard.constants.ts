/* @layer site-kit @kind constants */
import type { UploadPhase } from '../upload-job.type';

const MOVING: ReadonlySet<UploadPhase> = new Set(['queued', 'hashing', 'uploading', 'verifying']);

export { MOVING };
