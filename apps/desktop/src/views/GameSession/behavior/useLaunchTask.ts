/* @layer renderer-appshell @kind hook */
import { useEffect, useRef } from 'react';
import type { LaunchTask } from './useLaunchTask.type';

const useLaunchTask = (activeProfile: Profile | null, task: LaunchTask) => {
  const didRun = useRef(false);

  useEffect(() => {
    if (!activeProfile || didRun.current) return;
    const abort = new AbortController();

    void task({
      isCancelled: () => abort.signal.aborted,
      hasRun: () => didRun.current,
      markRan: () => { didRun.current = true; },
    });

    return () => abort.abort();
  }, [activeProfile]);
};

export { useLaunchTask };
