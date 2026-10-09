/* @layer renderer-app @kind logic */
import { bestSyncedRate, isSyncedRate } from '@shared/display/refresh-rate';

const refreshAdvisory = (refreshHz: number | null): string => {
  if (refreshHz === null || isSyncedRate(refreshHz)) return '';
  const target = bestSyncedRate(refreshHz);
  if (target === null) return '';
  return ` Your display is running at ${Math.round(refreshHz)} Hz, which is not a whole multiple of 60. Some frames will be shown longer than others whatever this setting does. Setting your display to ${target} Hz makes the timing even.`;
};

export { refreshAdvisory };
