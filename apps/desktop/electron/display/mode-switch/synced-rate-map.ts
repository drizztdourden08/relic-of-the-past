/* @layer electron-main @kind logic */
import { isSyncedRate, nearestMultiple } from '@shared/display/refresh-rate';
import { getDisplayModeDriver } from '../native';

const syncedRateMap = (): Map<number, number> => {
  const map = new Map<number, number>();
  for (const hz of getDisplayModeDriver().listRates()) {
    if (!isSyncedRate(hz)) continue;
    const label = nearestMultiple(hz) * 60;
    const best = map.get(label);
    if (best === undefined || Math.abs(hz - label) < Math.abs(best - label)) map.set(label, hz);
  }
  return map;
};

export { syncedRateMap };
