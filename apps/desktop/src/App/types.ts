import type { GameSettings } from '@shared/types/settings';

export type PageId = 'none' | 'picker' | 'profile' | 'data' | 'input-tester' | 'credits';

export interface ConfirmDialog {
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'danger' | 'default';
  onConfirm: () => void;
}

export interface RomDisplayInfo extends RomInfo {
  extractionStatus: RomExtractionStatus | 'idle';
}

export interface DisplaySettings {
  windowMode: GameSettings['windowMode'];
  isFullscreen: boolean;
  viewportConstraint: GameSettings['viewportConstraint'];
  aspectRatio: GameSettings['aspectRatio'];
  showFps: boolean;
  overworldEdgeEffect: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  isMuted: boolean;
}
