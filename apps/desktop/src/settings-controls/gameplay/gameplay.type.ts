/* @layer renderer-app @kind types */
import type { SettingsPatch } from '../settings-controls.type';

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
  disabled: boolean;
  onChange: SettingsPatch;
}

export type { DialogHoldRowProps, DialogStopSliderProps };
