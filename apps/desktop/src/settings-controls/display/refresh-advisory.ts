/* @layer renderer-app @kind logic */
import { bestSyncedRate, isSyncedRate } from '@drizztdourden08/brock-display';
import type { RefreshAdvisory } from './display.type';

const refreshAdvisory = (refreshHz: number | null): RefreshAdvisory | null => {
  if (refreshHz === null || isSyncedRate(refreshHz)) return null;
  const target = bestSyncedRate(refreshHz);
  if (target === null) return null;
  return { hz: Math.round(refreshHz), target };
};

export { refreshAdvisory };
