/* @layer site-kit @kind constants */
import type { UploadPhase } from '@rotp/hub-client';

const MOVING: ReadonlySet<UploadPhase> = new Set(['queued', 'hashing', 'uploading', 'verifying']);

export { MOVING };
