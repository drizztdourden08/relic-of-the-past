/* @layer site-kit @kind types */
import type { UploadJob } from './upload-job.type';
import type { createQueueState } from './queue-state';

type JobChange = Partial<UploadJob> | ((job: UploadJob) => Partial<UploadJob>);

type QueueState = ReturnType<typeof createQueueState>;

export type { QueueState, JobChange };
