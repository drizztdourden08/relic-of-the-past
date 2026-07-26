/* @layer renderer-other @kind hook */
/**
 * Subscribes to the shared display-rate reading, kicking off the first read on mount.
 *
 * Thin on purpose: the reading itself lives in the store so every consumer sees the same value
 * and a change made in one place (the settings panel switching the rate) is immediately visible
 * in another (the title bar's readout and its incompatible-rate tag).
 */
import { useEffect } from 'react';
import type { RefreshRateInfo } from '@shared/types/display';
import { useRefreshRateStore } from '../stores/refresh-rate-store';

const useRefreshRate = (): RefreshRateInfo => {
  const info = useRefreshRateStore((s) => s.info);
  const refresh = useRefreshRateStore((s) => s.refresh);

  // Only the first mount actually measures — the store drops overlapping calls, so several
  // consumers mounting together still produce a single reading.
  useEffect(() => {
    if (info.reportedHz === null && info.measuredHz === null) void refresh();
  }, [refresh, info.reportedHz, info.measuredHz]);

  return info;
};

export { useRefreshRate };
