/* @layer renderer-components @kind types */
import type React from 'react';
import type { GameSettings } from '@shared/types/settings';
import type { ToastItem } from '../../../../../design-system/primitives/Toast';
import type { ProfileHubProps } from '../ProfileHub.type';

type ParentCallbacks = Pick<ProfileHubProps,
  'onWindowModeChange' | 'onConstraintSettingsChange' | 'onMasterVolumeChange' | 'onDisplayPerfChange'
  | 'onSaveSlotSettingsChange' | 'onEdgeEffectChange' | 'onShadowCastingChange' | 'onPixelPerfectChange'
>;

interface SettingsEffectDeps extends ParentCallbacks {
  profileId: string;
  isGameRunning: boolean;
  changedKeys: (keyof GameSettings)[];
  restartToastShownRef: React.MutableRefObject<boolean>;
  setToasts: React.Dispatch<React.SetStateAction<ToastItem[]>>;
  setFullscreen: (on: boolean) => void;
}

export type { ParentCallbacks, SettingsEffectDeps };
