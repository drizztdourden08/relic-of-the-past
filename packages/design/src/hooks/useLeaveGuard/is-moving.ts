/* @layer site-kit @kind logic */
import type { UploadJob } from '@rotp/hub-client';
import { MOVING } from './leave-guard.constants';

const isMoving = (job: UploadJob) => MOVING.has(job.phase);

export { isMoving };
