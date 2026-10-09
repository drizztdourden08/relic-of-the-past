/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { releaseHold } from '@app/lib/input/controller-hold-store';
import type { DeviceEntry } from '@shared/ipc';
import type { HoldTransitionStatus } from '../diagnostics-wizard.type';
import { settledReadyDevices } from './settled-ready-devices';

const useStep1Shutdown = (active: boolean, runGeneration = 0) => {
  const [preReleaseReady, setPreReleaseReady] = useState<DeviceEntry[]>([]);
  const [releaseStatus, setReleaseStatus] = useState<HoldTransitionStatus>('pending');

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const isCancelled = () => cancelled;
    setReleaseStatus('pending');

    const run = async () => {
      try {
        const ready = await settledReadyDevices(isCancelled);
        if (cancelled) return;
        setPreReleaseReady(ready);
        const ok = await releaseHold();
        if (!cancelled) setReleaseStatus(ok ? 'done' : 'error');
      } catch {
        if (!cancelled) setReleaseStatus('error');
      }
    };
    void run();

    return () => { cancelled = true; };
  }, [active, runGeneration]);

  return { preReleaseReady, releaseStatus };
};

export { useStep1Shutdown };
