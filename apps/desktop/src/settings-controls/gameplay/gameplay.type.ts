/* @layer renderer-app @kind types */
import type { SettingsPatch } from '../settings-controls.type';

interface DialogStopSliderProps {
  stops: readonly number[];
  value: number;
  onChange: (stop: number) => void;
  disabled?: boolean;
  formatStop?: (stop: number) => string;
}

interface DialogHoldControlProps {
  enabled: boolean;
  speed: number;
  disabled: boolean;
  onChange: SettingsPatch;
}

export type { DialogHoldControlProps, DialogStopSliderProps };
