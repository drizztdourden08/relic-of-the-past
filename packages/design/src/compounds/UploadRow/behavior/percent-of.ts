/* @layer site-kit @kind logic */
import type { UploadJob } from '@rotp/hub-client';

const percentOf = (job: UploadJob) => Math.round(Math.max(0, Math.min(1, job.bytes ? job.sent / job.bytes : 0)) * 100);

export { percentOf };
