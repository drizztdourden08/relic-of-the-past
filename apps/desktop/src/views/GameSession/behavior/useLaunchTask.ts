/* @layer renderer-appshell @kind hook */
import { useEffect, useRef } from 'react';
import type { LaunchTask } from './useLaunchTask.type';

// The task ends only on unmount. A task that loads a different profile (--profile-name,
// --ap-connect, --lobby-join) changes activeProfile itself and must keep running.
const useLaunchTask = (activeProfile: Profile | null, task: LaunchTask) => {
  const didRun = useRef(false);
  const mounted = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    mounted.current = controller;
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = mounted.current;
    if (!activeProfile || didRun.current || controller === null) return;

    void task({
      isCancelled: () => controller.signal.aborted,
      hasRun: () => didRun.current,
      markRan: () => { didRun.current = true; },
    });
  }, [activeProfile]);
};

export { useLaunchTask };
