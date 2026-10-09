/* @layer renderer-components @kind types */
import type { SyncedRateStatus } from '@shared/types/display';

interface RefreshRateControlProps {
  status: SyncedRateStatus;
  detectedHz: number | null;
  value: number;
  onChange: (hz: number) => void;
}

interface ChangeRefreshRateDialogProps {
  open: boolean;
  targetHz: number;
  currentHz: number | null;
  onConfirm: () => void;
  onCancel: () => void;
}

interface ApplyRefreshRate {
  apply: (hz: number) => Promise<void>;
  applying: boolean;
  result: SyncedRateStatus | null;
}

export type { ApplyRefreshRate, ChangeRefreshRateDialogProps, RefreshRateControlProps };
