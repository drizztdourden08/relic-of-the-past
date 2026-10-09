/* @layer shared-game @kind logic */
import { HZ_TOLERANCE } from './refresh-rate.constants';

const syncedRateOptions = (hz: number | null): number[] => {
  if (hz === null || hz <= 0) return [];
  const ceilingWithTolerance = Math.floor((hz + HZ_TOLERANCE) / 60);
  return Array.from({ length: Math.max(0, ceilingWithTolerance) }, (_, i) => (i + 1) * 60);
};

export { syncedRateOptions };
