/* @layer site-kit @kind hook */
import { useEffect } from 'react';
import type { UploadJob } from '../upload-job.type';
import { isMoving } from './is-moving';

const useLeaveGuard = (jobs: readonly UploadJob[]) => {
  const moving = jobs.some(isMoving);
  useEffect(() => {
    if (!moving) return undefined;
    const ask = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', ask);
    return () => window.removeEventListener('beforeunload', ask);
  }, [moving]);
};

export { useLeaveGuard };
