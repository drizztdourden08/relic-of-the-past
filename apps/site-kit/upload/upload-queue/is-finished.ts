/* @layer site-kit @kind logic */
import type { UploadJob } from '../upload-job.type';

const isFinished = (job: UploadJob) => job.phase === 'done' || job.phase === 'failed';

export { isFinished };
