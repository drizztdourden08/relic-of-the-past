/* @layer renderer-appshell @kind hook */
import { useEffect, useRef } from 'react';
import type { LaunchTask } from './useLaunchTask.type';

const useLaunchTask = (activeProfile: Profile | null, task: LaunchTask) => {
  const didRun = useRef(false);
  const cancelledOnUnmountOnly = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    cancelledOnUnmountOnly.current = controller;
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = cancelledOnUnmountOnly.current;
    if (!activeProfile || didRun.current || controller === null) return;

    void task({
      isCancelled: () => controller.signal.aborted,
      hasRun: () => didRun.current,
      markRan: () => { didRun.current = true; },
    });
  }, [activeProfile]);
};

export { useLaunchTask };
