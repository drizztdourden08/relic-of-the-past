/* @layer shared-platform @kind types */
import type { RefreshRateInfo, SyncedRateStatus } from '../../types/display';

interface DisplayPort {
  getRefreshRate: () => Promise<RefreshRateInfo>;
  getSyncedRateStatus: () => Promise<SyncedRateStatus>;
  setSyncedRatePreference: (enabled: boolean, targetHz: number) => Promise<SyncedRateStatus>;
  applyRefreshRate: (hz: number) => Promise<SyncedRateStatus>;
}

export type { DisplayPort };
