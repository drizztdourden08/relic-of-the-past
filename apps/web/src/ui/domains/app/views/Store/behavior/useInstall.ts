/* @layer renderer-components @kind hook */
/**
 * Installing and updating, one job per item. The main process reports each step on
 * `store:installProgress`; the job keeps the latest one for the bar. An update is an install
 * of the live version over the installed one. A cancelled install ends with no error.
 */
import { useCallback, useEffect, useState } from 'react';
import type { InstallJob } from '../Store.type';

type InstallParams = {
  /** Runs after a finished install, so the installed list and the shell's lists refresh. */
  onInstalled: () => void;
  onSignedOut: () => void;
};

const IDLE: InstallJob = { running: false, progress: null, error: null };

const useInstall = (params: InstallParams) => {
  const { onInstalled, onSignedOut } = params;
  const [jobs, setJobs] = useState<Record<string, InstallJob>>({});

  const patch = useCallback((itemId: string, change: Partial<InstallJob>) => {
    setJobs((current) => ({ ...current, [itemId]: { ...(current[itemId] ?? IDLE), ...change } }));
  }, []);

  useEffect(() => {
    const unsubscribe = window.api.onStoreInstallProgress?.(({ itemId, progress }) => patch(itemId, { progress }));
    return () => { unsubscribe?.(); };
  }, [patch]);

  const install = useCallback(async (itemId: string, version: number | null = null) => {
    patch(itemId, { running: true, progress: null, error: null });
    const result = await window.api.storeInstall({ itemId, version });
    if (result.ok) {
      patch(itemId, IDLE);
      onInstalled();
      return;
    }
    if (result.signedOut) onSignedOut();
    patch(itemId, { running: false, progress: null, error: result.cancelled ? null : result.error });
  }, [patch, onInstalled, onSignedOut]);

  const cancel = useCallback((itemId: string) => { void window.api.storeCancel(itemId); }, []);

  const jobOf = useCallback((itemId: string): InstallJob => jobs[itemId] ?? IDLE, [jobs]);

  return { jobOf, install, cancel };
};

type StoreInstaller = ReturnType<typeof useInstall>;

export { useInstall };
export type { StoreInstaller };
