/* @layer shared-game @kind logic */
import type { RefreshRateInfo } from '../../types/display';
import { effectiveHz } from './effective-hz';
import { isSyncedRate } from './is-synced-rate';
import { nearestMultiple } from './nearest-multiple';
import { syncedRateOptions } from './synced-rate-options';

const targetRateOptions = (info: RefreshRateInfo | null): number[] => {
  const enumerated = (info?.modes ?? [])
    .filter((m) => m.sameResolution && isSyncedRate(m.hz))
    .map((m) => nearestMultiple(m.hz) * 60);
  if (enumerated.length) return [...new Set(enumerated)].sort((a, b) => a - b);
  return syncedRateOptions(effectiveHz(info));
};

export { targetRateOptions };
