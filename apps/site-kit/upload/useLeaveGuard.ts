/* @layer site-kit @kind hook */
/**
 * Asks before the page is left while a job is still moving. Leaving only pauses a job (the
 * next visit continues it), so the browser's own prompt is enough; it shows no text of ours.
 */
import { useEffect } from 'react';
import type { UploadJob, UploadPhase } from './upload-job.type';

const MOVING: ReadonlySet<UploadPhase> = new Set(['queued', 'hashing', 'uploading', 'verifying']);

const isMoving = (job: UploadJob) => MOVING.has(job.phase);

const useLeaveGuard = (jobs: readonly UploadJob[]) => {
  const moving = jobs.some(isMoving);
  useEffect(() => {
    if (!moving) return undefined;
    const ask = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Older browsers show the prompt only when returnValue is set.
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', ask);
    return () => window.removeEventListener('beforeunload', ask);
  }, [moving]);
};

export { useLeaveGuard, isMoving };
