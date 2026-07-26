/* @layer renderer-components @kind hook */
/** Applies a refresh rate for good and reports the host's verdict. */
import { useState, useCallback } from 'react';
import type { SyncedRateStatus } from '@shared/types/display';
import { getPlatform } from '@app/platform/get-platform';

interface ApplyRefreshRate {
  apply: (hz: number) => Promise<void>;
  applying: boolean;
  /** The host's status after the last attempt, including any failure reason. */
  result: SyncedRateStatus | null;
}

const useApplyRefreshRate = (): ApplyRefreshRate => {
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<SyncedRateStatus | null>(null);

  const apply = useCallback(async (hz: number) => {
    setApplying(true);
    try {
      setResult(await getPlatform().display.applyRefreshRate(hz));
    } catch {
      // The host could not be reached at all; leave the previous status showing.
    } finally {
      setApplying(false);
    }
  }, []);

  return { apply, applying, result };
};

export { useApplyRefreshRate };
export type { ApplyRefreshRate };
