/* @layer site-kit @kind constants */
import type { UploadPhase } from '../../../upload/upload-job.type';

const CANCELLABLE: ReadonlySet<UploadPhase> = new Set(['queued', 'hashing', 'uploading', 'needs-file']);

export { CANCELLABLE };
