/* @layer shared-types @kind types */
import type { SnesButton } from '../snes';

type DeviceFamily =
  | 'xbox'
  | 'playstation'
  | 'nintendo'
  | '8bitdo'
  | 'keyboard'
  | 'generic';

type InputApi = 'hid' | 'webapi';

interface NoneBinding {
  type: 'none';
}

interface KeyboardBinding {
  type: 'keyboard';
  code: string;
  label?: string;
  modifiers?: {
    shift?: boolean;
    ctrl?: boolean;
    alt?: boolean;
  };
}

interface GamepadButtonBinding {
  type: 'gamepad-button';
  index: number;
  label?: string;
}

interface GamepadAxisBinding {
  type: 'gamepad-axis';
  axisIndex: number;
  direction: '+' | '-';
  label?: string;
}

type InputBinding = NoneBinding | KeyboardBinding | GamepadButtonBinding | GamepadAxisBinding;

interface ButtonIcon {
  key: string;
  path: string | null;
  label: string;
}

interface ButtonMapping {
  snesButton: SnesButton;
  binding: InputBinding;
  icon: ButtonIcon | null;
  sourceVid?: string | null;
  sourcePid?: string | null;
}

export type {
  ButtonIcon,
  ButtonMapping,
  DeviceFamily,
  GamepadAxisBinding,
  GamepadButtonBinding,
  InputApi,
  InputBinding,
  KeyboardBinding,
  NoneBinding,
};
