/* @layer renderer-appshell @kind types */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import type { useAudioSettings } from './behavior/useAudioSettings';
import type { useConfirmDialog } from './behavior/useConfirmDialog';
import type { useDisplaySettings } from './behavior/useDisplaySettings';
import type { useGameLifecycle } from './behavior/useGameLifecycle';
import type { useProfileManagement } from './behavior/useProfileManagement';
import type { useSaveOverlay } from './behavior/useSaveOverlay';
import type { useSaveStateSettings } from './behavior/useSaveStateSettings';
import type { ProfileLoadedData } from './behavior/useProfileManagement.type';

interface ConfirmDialog {
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'danger' | 'default';
  onConfirm: () => void;
}

interface RomDisplayInfo extends RomInfo {
  extractionStatus: RomExtractionStatus | 'idle';
}

interface DisplaySettings {
  windowMode: GameSettings['windowMode'];
  isFullscreen: boolean;
  viewportConstraint: GameSettings['viewportConstraint'];
  aspectRatio: GameSettings['aspectRatio'];
  showFps: boolean;
  overworldEdgeEffect: boolean;
}

interface AudioSettings {
  masterVolume: number;
  isMuted: boolean;
}

type LoadedProfile = ProfileLoadedData;

interface LoadedProfileTargets {
  game: ReturnType<typeof useGameLifecycle>;
  display: ReturnType<typeof useDisplaySettings>;
  audio: ReturnType<typeof useAudioSettings>;
  saveState: ReturnType<typeof useSaveStateSettings>;
}

interface GameSessionValue extends LoadedProfileTargets {
  dialogs: ReturnType<typeof useConfirmDialog>;
  saveOverlay: ReturnType<typeof useSaveOverlay>;
  profileMgmt: ReturnType<typeof useProfileManagement>;
  startGame: () => void;
  resetGame: () => void;
}

interface GameSessionProps {
  children: ReactNode;
}

export type {
  AudioSettings, ConfirmDialog, DisplaySettings, GameSessionProps, GameSessionValue, LoadedProfile, LoadedProfileTargets, RomDisplayInfo,
};
