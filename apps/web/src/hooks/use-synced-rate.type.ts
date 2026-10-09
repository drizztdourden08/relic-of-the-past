/* @layer renderer-other @kind types */
import type { SyncedRateStatus } from '@shared/types/display';

interface SyncedRateControl {
  status: SyncedRateStatus;
  push: (enabled: boolean, targetHz: number) => void;
}

export type { SyncedRateControl };
