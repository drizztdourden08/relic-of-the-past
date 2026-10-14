/* @layer site-kit @kind hook */
import { useCallback } from 'react';
import { useUploadQueue } from '../../../hooks/useUploadQueue/useUploadQueue';
import { isMoving } from '../../../hooks/useLeaveGuard';
import type { UploadQueueControls } from '@rotp/hub-client';
import { canFollowUp } from './can-follow-up';
import { jobOf } from './job-of';
import { offersFollowUp } from './offers-follow-up';

const useDialogJob = (queue: UploadQueueControls) => {
  const { jobs, openId } = useUploadQueue(queue);
  const job = jobOf(jobs, openId);
  const close = useCallback(() => queue.open(null), [queue]);
  const jobId = job?.id ?? null;
  const followUp = useCallback(() => {
    if (jobId) queue.followUp(jobId);
  }, [queue, jobId]);

  return {
    job,
    close,
    followUp,
    offersFollowUp: offersFollowUp(queue.followUpLabel, job),
    canFollowUp: canFollowUp(job),
    followUpLabel: queue.followUpLabel,
    showKeptCopy: job !== null && job.fileKept && isMoving(job),
  };
};

export { useDialogJob };
