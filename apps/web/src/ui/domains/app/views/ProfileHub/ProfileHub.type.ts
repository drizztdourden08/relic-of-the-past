/* @layer renderer-components @kind types */
import type { Profile } from '@shared/types/profile';
import type { GameSettings } from '@shared/types/settings';

type ProfileHubTab =
  | 'home'
  | 'settings' // Display
  | 'graphics'
  | 'audio'
  | 'gameplay'
  | 'bugfixes'
  | 'hud'
  | 'controls'
  | 'haptics'
  | 'system'
  | 'mobile';

interface ProfileHubProps {
  profile: Profile;
  isGameRunning: boolean;
  onStartGame: () => void;
  onStopGame: () => void;
  onResetGame: () => void;
  onWindowModeChange?: (mode: GameSettings['windowMode']) => void;
  onConstraintSettingsChange?: (constraint: GameSettings['viewportConstraint'], aspectRatio: GameSettings['aspectRatio']) => void;
  onMasterVolumeChange?: (volume: number) => void;
  onDisplayPerfChange?: (enabled: boolean) => void;
  onSaveSlotSettingsChange?: (enhanced: boolean, holdDuration: number) => void;
  onEdgeEffectChange?: (enabled: boolean) => void;
  onPixelPerfectChange?: (enabled: boolean) => void;
  onShadowCastingChange?: (enabled: boolean) => void;
  masterVolumeOverride?: { volume: number; version: number } | null;
  activeTab?: ProfileHubTab;
  onTabChange?: (tab: ProfileHubTab) => void;
}

export type {
  ProfileHubProps,
  ProfileHubTab,
};
