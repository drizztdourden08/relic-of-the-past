/* @layer renderer-components @kind types */

interface HomeTabProps {
  profileId: string;
  romFile: string;
  isGameRunning: boolean;
  onStartGame: () => void;
  lastPlayed?: number;
  created?: number;
  windowMode?: string;
}

interface SlotInfo {
  slot: number;
  timestamp: number | null;
  screenshot: string | null;
}

interface DialogState {
  type: 'overwrite' | 'delete' | 'create' | 'import-sram' | 'import-sram-invalid' | null;
  targetId?: string;
  targetName?: string;
  pendingBytes?: Uint8Array;
  detail?: string;
}

export type { HomeTabProps, SlotInfo, DialogState };
