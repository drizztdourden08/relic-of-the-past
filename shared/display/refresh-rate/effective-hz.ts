/* @layer shared-game @kind logic */
import type { RefreshRateInfo } from '../../types/display';
import { MIN_MEASURED_HZ } from './refresh-rate.constants';

const effectiveHz = (info: RefreshRateInfo | null): number | null => {
  if (!info) return null;
  if (info.measuredHz !== null && info.measuredHz >= MIN_MEASURED_HZ) return info.measuredHz;
  if (info.reportedHz !== null && info.reportedHz > 0) return info.reportedHz;
  return null;
};

export { effectiveHz };
