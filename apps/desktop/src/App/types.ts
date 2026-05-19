import type { GameSettings } from '@shared/types/settings';

type PageId = 'none' | 'picker' | 'profile' | 'data' | 'input-tester' | 'credits';

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

export type {
  AudioSettings,
  ConfirmDialog,
  DisplaySettings,
  PageId,
  RomDisplayInfo
};
