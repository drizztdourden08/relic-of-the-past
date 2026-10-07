/* @layer site-kit @kind hook */
/**
 * The job the dialog shows, and what its footer offers: Close always, and the site's
 * follow-up (the store's "Send for review") for a job with a file that has not failed,
 * pressable once the job is done and until the action went through.
 */
import { useCallback } from 'react';
import { useUploadQueue } from '../../../upload/useUploadQueue';
import { isMoving } from '../../../upload/useLeaveGuard';
import type { UploadQueueControls } from '../../../upload/upload-queue.type';

const useDialogJob = (queue: UploadQueueControls) => {
  const { jobs, openId } = useUploadQueue(queue);
  const job = openId === null ? null : jobs.find((entry) => entry.id === openId) ?? null;
  const close = useCallback(() => queue.open(null), [queue]);
  const jobId = job?.id ?? null;
  const followUp = useCallback(() => {
    if (jobId) queue.followUp(jobId);
  }, [queue, jobId]);

  const offersFollowUp = queue.followUpLabel !== null && job !== null && job.fileName !== null
    && job.phase !== 'failed' && job.followUp !== 'done';
  const canFollowUp = job?.phase === 'done' && job.followUp === 'idle';
  const showKeptCopy = job !== null && job.fileKept && isMoving(job);
  return { job, close, followUp, offersFollowUp, canFollowUp, followUpLabel: queue.followUpLabel, showKeptCopy };
};

export { useDialogJob };
