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
  type: 'overwrite' | 'delete' | 'create' | null;
  targetId?: string;
  targetName?: string;
}

export type { HomeTabProps, SlotInfo, DialogState };
