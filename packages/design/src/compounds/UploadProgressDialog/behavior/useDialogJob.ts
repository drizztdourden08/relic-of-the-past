/* @layer site-kit @kind hook */
import { useCallback } from 'react';
import { useUploadQueue } from '../../../hooks/useUploadQueue/useUploadQueue';
import { isMoving } from '../../../hooks/useLeaveGuard';
import type { UploadQueueControls } from '@rotp/hub-client';

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
