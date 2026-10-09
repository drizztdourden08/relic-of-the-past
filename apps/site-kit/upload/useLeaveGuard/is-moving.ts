/* @layer site-kit @kind logic */
import type { UploadJob } from '../upload-job.type';
import { MOVING } from './useLeaveGuard.constants';

const isMoving = (job: UploadJob) => MOVING.has(job.phase);

export { isMoving };
