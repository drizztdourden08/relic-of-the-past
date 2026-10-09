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
  onShowHudLayout: () => void;
  onShowCredits: () => void;
  onShowSpriteDebug: () => void;
  onShowDataInspector: () => void;
  onShowConnectionDebug: () => void;
  onToggleDataset: () => void;
  onToggleSimulator: () => void;
  onToggleMusic: () => void;
  onShowShadowEditor: () => void;
  onShowAbout: () => void;
  onShowRandomizer: () => void;
  onShowBugReport: () => void;
  activeProfile: Profile | null;
  gameRunning: boolean;
  widgetVisibility?: Record<string, boolean>;
  developerToolsEnabled?: boolean;
  windowMode?: GameSettings['windowMode'];
  isMuted?: boolean;
  onToggleMute?: () => void;
  showFps?: boolean;
  onShowDisplaySettings?: () => void;
  updateAvailable?: boolean;
  onUpdateClick?: () => void;
  onCheckForUpdates?: () => void;
}

export type { TitleBarProps };
