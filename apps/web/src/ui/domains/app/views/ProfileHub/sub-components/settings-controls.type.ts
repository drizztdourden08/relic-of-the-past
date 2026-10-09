/* @layer renderer-components @kind types */
import type { GameSettings } from '@shared/types/settings';

type SettingsPatch = (patch: Partial<GameSettings>) => void;

interface SettingsTabProps {
  settings: GameSettings;
  onChange: SettingsPatch;
}

interface ProfileScopedTabProps extends SettingsTabProps {
  profileId: string;
}

interface TurboSpeedControlProps {
  value: number;
  onChange: (speed: number) => void;
  disabled?: boolean;
}

interface DialogStopSliderProps {
  stops: readonly number[];
  value: number;
  onChange: (stop: number) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  formatStop?: (stop: number) => string;
}

interface DialogHoldRowProps {
  label: string;
  description: string;
  enabled: boolean;
  speed: number;
  onChange: SettingsPatch;
}

interface DialogColorControlProps {
  label: string;
  description: string;
  value: string;
  original: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
}

export type {
  DialogColorControlProps, DialogHoldRowProps, DialogStopSliderProps, ProfileScopedTabProps,
  SettingsPatch, SettingsTabProps, TurboSpeedControlProps,
};
