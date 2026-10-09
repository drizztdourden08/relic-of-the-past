/* @layer renderer-other @kind hook */
import { useEffect } from 'react';
import type { RefreshRateInfo } from '@shared/types/display';
import { useRefreshRateStore } from '../stores/refresh-rate-store';

const useRefreshRate = (): RefreshRateInfo => {
  const info = useRefreshRateStore((s) => s.info);
  const refresh = useRefreshRateStore((s) => s.refresh);

  useEffect(() => {
    if (info.reportedHz === null && info.measuredHz === null) void refresh();
  }, [refresh, info.reportedHz, info.measuredHz]);

  return info;
};

export { useRefreshRate };
