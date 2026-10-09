/* @layer renderer-components @kind hook */
import { displayPort } from '@app/platform/display-port';
import { useState, useCallback } from 'react';
import type { SyncedRateStatus } from '@shared/types/display';
import { useRefreshRateStore } from '@app/stores/refresh-rate-store';
import { RATE_SETTLE_DELAY_MS } from '../RefreshRateControl.constants';
import type { ApplyRefreshRate } from '../RefreshRateControl.type';

const useApplyRefreshRate = (): ApplyRefreshRate => {
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<SyncedRateStatus | null>(null);
  const refreshDetected = useRefreshRateStore((s) => s.refresh);

  const apply = useCallback(async (hz: number) => {
    setApplying(true);
    try {
      setResult(await displayPort().applyRefreshRate(hz));
      await new Promise((r) => setTimeout(r, RATE_SETTLE_DELAY_MS));
      await refreshDetected();
    } catch {
      setApplying(false);
      return;
    }
    setApplying(false);
  }, [refreshDetected]);

  return { apply, applying, result };
};

export { useApplyRefreshRate };
export type { ApplyRefreshRate };
