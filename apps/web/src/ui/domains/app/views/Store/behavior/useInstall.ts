/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import type { InstallJob, InstallParams } from '../Store.type';
import { IDLE_JOB } from '../Store.constants';

const useInstall = (params: InstallParams) => {
  const { onInstalled, onSignedOut } = params;
  const [jobs, setJobs] = useState<Record<string, InstallJob>>({});

  const patch = useCallback((itemId: string, change: Partial<InstallJob>) => {
    setJobs((current) => ({ ...current, [itemId]: { ...(current[itemId] ?? IDLE_JOB), ...change } }));
  }, []);

  useEffect(() => {
    const unsubscribe = window.api.onStoreInstallProgress?.(({ itemId, progress }) => patch(itemId, { progress }));
    return () => { unsubscribe?.(); };
  }, [patch]);

  const install = useCallback(async (itemId: string, version: number | null = null) => {
    patch(itemId, { running: true, progress: null, error: null });
    const result = await window.api.storeInstall({ itemId, version });
    if (result.ok) {
      patch(itemId, IDLE_JOB);
      onInstalled();
      return;
    }
    if (result.signedOut) onSignedOut();
    patch(itemId, { running: false, progress: null, error: result.cancelled ? null : result.error });
  }, [patch, onInstalled, onSignedOut]);

  const cancel = useCallback((itemId: string) => { void window.api.storeCancel(itemId); }, []);

  const jobOf = useCallback((itemId: string): InstallJob => jobs[itemId] ?? IDLE_JOB, [jobs]);

  return { jobOf, install, cancel };
};

export { useInstall };
