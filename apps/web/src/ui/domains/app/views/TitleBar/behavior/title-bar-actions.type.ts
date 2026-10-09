/* @layer renderer-components @kind types */
interface TitleBarActionDeps {
  onSearch: () => void;
  onShowBugReport: () => void;
  isMuted: boolean;
  onToggleMute?: () => void;
  gameRunning: boolean;
  onToggleSaveStates: () => void;
  updateAvailable: boolean;
  onUpdateClick?: () => void;
  fps: number;
  refreshHz: number | null;
  refreshSynced: boolean;
  onShowDisplaySettings?: () => void;
}

export type { TitleBarActionDeps };
