/* @layer renderer-components @kind types */
import type React from 'react';
import type { GameSettings } from '@shared/types/settings';

interface ParentCallbacks {
  onWindowModeChange?: (mode: GameSettings['windowMode']) => void;
  onConstraintSettingsChange?: (constraint: GameSettings['viewportConstraint'], aspectRatio: GameSettings['aspectRatio']) => void;
  onMasterVolumeChange?: (volume: number) => void;
  onDisplayPerfChange?: (enabled: boolean) => void;
  onSaveSlotSettingsChange?: (enhanced: boolean, holdDuration: number) => void;
  onEdgeEffectChange?: (enabled: boolean) => void;
  onShadowCastingChange?: (enabled: boolean) => void;
  onPixelPerfectChange?: (enabled: boolean) => void;
}

interface SettingsEffectDeps extends ParentCallbacks {
  profileId: string;
  isGameRunning: boolean;
  changedKeys: (keyof GameSettings)[];
  restartToastShownRef: React.MutableRefObject<boolean>;
  setFullscreen: (on: boolean) => void;
}

interface SettingsBridgeDeps {
  isGameRunning: boolean;
  callbacks: ParentCallbacks;
  masterVolumeOverride: { volume: number; version: number } | null;
}

export type { ParentCallbacks, SettingsBridgeDeps, SettingsEffectDeps };
