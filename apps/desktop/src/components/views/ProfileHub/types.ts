import type { Profile } from '@shared/types/profile';
import type { GameSettings } from '@shared/types/settings';

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
  masterVolumeOverride?: { volume: number; version: number } | null;
}

export type {
  ProfileHubProps,
};
