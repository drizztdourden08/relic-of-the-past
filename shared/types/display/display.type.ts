/* @layer shared-types @kind types */
interface DisplayModeInfo {
  hz: number;
  sameResolution: boolean;
}

interface RefreshRateInfo {
  reportedHz: number | null;
  measuredHz: number | null;
  modes: DisplayModeInfo[];
}

interface SyncedRateStatus {
  supported: boolean;
  unsupportedReason: string;
  availableRates: number[];
  currentHz: number | null;
  activeHz: number | null;
  bestHz: number | null;
  lastError: string;
}

export type { DisplayModeInfo, RefreshRateInfo, SyncedRateStatus };
