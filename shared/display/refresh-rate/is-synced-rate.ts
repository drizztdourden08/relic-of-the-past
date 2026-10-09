/* @layer shared-game @kind logic */
import { nearestMultiple } from './nearest-multiple';
import { HZ_TOLERANCE } from './refresh-rate.constants';

const isSyncedRate = (hz: number | null): boolean => {
  if (hz === null || hz <= 0) return false;
  return Math.abs(hz - nearestMultiple(hz) * 60) <= HZ_TOLERANCE;
};

export { isSyncedRate };
