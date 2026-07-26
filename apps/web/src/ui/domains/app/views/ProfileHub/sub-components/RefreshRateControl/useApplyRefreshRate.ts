/* @layer renderer-components @kind hook */
/** Applies a refresh rate for good and reports the host's verdict. */
import { useState, useCallback } from 'react';
import type { SyncedRateStatus } from '@shared/types/display';
import { getPlatform } from '@app/platform/get-platform';
import { useRefreshRateStore } from '@app/stores/refresh-rate-store';

interface ApplyRefreshRate {
  apply: (hz: number) => Promise<void>;
  applying: boolean;
  /** The host's status after the last attempt, including any failure reason. */
  result: SyncedRateStatus | null;
}

const useApplyRefreshRate = (): ApplyRefreshRate => {
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<SyncedRateStatus | null>(null);
  const refreshDetected = useRefreshRateStore((s) => s.refresh);

  const apply = useCallback(async (hz: number) => {
    setApplying(true);
    try {
      setResult(await getPlatform().display.applyRefreshRate(hz));
      // The display is on a different rate now, so every readout of it is stale — the panel's
      // own "detected" line, the title-bar counter, and its incompatible-rate tag. Re-read once
      // the switch has settled; a mode change is not instant and measuring mid-switch would
      // sample the old rate.
      await new Promise((r) => setTimeout(r, 1200));
      await refreshDetected();
    } catch {
      // The host could not be reached at all; leave the previous status showing.
    } finally {
      setApplying(false);
    }
  }, [refreshDetected]);

  return { apply, applying, result };
};

export { useApplyRefreshRate };
export type { ApplyRefreshRate };
