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
  onShowSpriteDebug: () => void;
  onShowConnectionDebug: () => void;
  onToggleDataset: () => void;
  onShowShadowEditor: () => void;
  activeProfile: Profile | null;
  gameRunning: boolean;
  windowMode?: GameSettings['windowMode'];
  isMuted?: boolean;
  onToggleMute?: () => void;
  showFps?: boolean;
}

export type {
  TitleBarProps,
};
