/* @layer renderer-components @kind types */
import type { Profile } from '@shared/types/profile';
import type { GameSettings } from '@shared/types/settings';

interface TitleBarProps {
  onImportRom: () => void;
  onSwitchProfile: () => void;
  onShowProfile: () => void;
  onShowLogs: () => void;
  onToggleSaveStates: () => void;
  onToggleInventory: () => void;
  onToggleChecks: () => void;
  onToggleDebug: () => void;
  onToggleCheats: () => void;
  onShowDataManager: (tab?: string) => void;
  onShowInputTester: () => void;
  onShowCredits: () => void;
  onShowDesignGallery: () => void;
  onShowSpriteDebug: () => void;
  onShowDatasetInspector: () => void;
  onShowConnectionDebug: () => void;
  onToggleDataset: () => void;
  onToggleSimulator: () => void;
  onShowShadowEditor: () => void;
  onShowAbout: () => void;
  onShowBugReport: () => void;
  activeProfile: Profile | null;
  gameRunning: boolean;
  /** Visibility of each toggleable widget, keyed by widget id, for menu checkmarks. */
  widgetVisibility?: Record<string, boolean>;
  windowMode?: GameSettings['windowMode'];
  isMuted?: boolean;
  onToggleMute?: () => void;
  showFps?: boolean;
  /** Opens the Display settings — used by the incompatible-refresh-rate tag. */
  onShowDisplaySettings?: () => void;
  updateAvailable?: boolean;
  onUpdateClick?: () => void;
  onCheckForUpdates?: () => void;
}

export type {
  TitleBarProps,
};
