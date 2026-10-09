/* @layer renderer-components @kind types */
import type { GameSettings } from '@shared/types/settings';
import type { ProfileHubProps, ProfileHubTab } from '../ProfileHub.type';

interface ProfileHubPaneProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  profile: ProfileHubProps['profile'];
  isGameRunning: boolean;
  onStartGame: () => void;
  onStopGame: () => void;
  onResetGame: () => void;
}

interface ProfileHubBodyProps extends ProfileHubPaneProps {
  activeTab: ProfileHubTab;
  setActiveTab: (t: ProfileHubTab) => void;
}

interface ProfileHubTabContentProps extends ProfileHubPaneProps {
  tab: ProfileHubTab;
}

export type { ProfileHubBodyProps, ProfileHubPaneProps, ProfileHubTabContentProps };
