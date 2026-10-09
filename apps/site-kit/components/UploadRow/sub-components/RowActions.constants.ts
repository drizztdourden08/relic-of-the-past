/* @layer site-kit @kind constants */
import type { UploadPhase } from '@rotp/hub-client';

const CANCELLABLE: ReadonlySet<UploadPhase> = new Set(['queued', 'hashing', 'uploading', 'needs-file']);

export { CANCELLABLE };
