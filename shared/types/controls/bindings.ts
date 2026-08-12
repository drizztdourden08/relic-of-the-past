/* @layer shared-types @kind types */
import type { SnesButton } from './snes';

// ── Controller families (for icon sets) ──

type DeviceFamily =
  | 'xbox'
  | 'playstation'
  | 'nintendo'
  | '8bitdo'
  | 'keyboard'
  | 'generic';

/**
 * Which input API a controller uses for actual button/axis reading:
 *  - 'hid':    Already-decoded state via SDL3 — every gamepad, on every
 *              platform that has SDL3 (desktop only; see the platform hosts).
 *  - 'webapi': The keyboard's own DOM key events.
 */
type InputApi = 'hid' | 'webapi';

// ── Input bindings ──

interface NoneBinding {
  type: 'none';
}

interface KeyboardBinding {
  type: 'keyboard';
  code: string;       // KeyboardEvent.code, e.g. "KeyZ", "ArrowUp"
  label?: string;     // Display override, e.g. "Z"
  modifiers?: {
    shift?: boolean;
    ctrl?: boolean;
    alt?: boolean;
  };
}

interface GamepadButtonBinding {
  type: 'gamepad-button';
  index: number;      // Standard Gamepad button index (0-16)
  label?: string;
}

interface GamepadAxisBinding {
  type: 'gamepad-axis';
  axisIndex: number;  // 0-3
  direction: '+' | '-';
  label?: string;
}

type InputBinding = NoneBinding | KeyboardBinding | GamepadButtonBinding | GamepadAxisBinding;

// ── Button icon reference ──

interface ButtonIcon {
  key: string;          // e.g. "xbox-a", "ps-cross", "switch-b"
  path: string | null;  // asset path — null until icons are provided
  label: string;        // text fallback: "A", "✕", "B"
}

// ── Per-button mapping ──

interface ButtonMapping {
  snesButton: SnesButton;
  binding: InputBinding;
  icon: ButtonIcon | null; // null = no icon shown, layout unchanged
  /** VID of the device that created this binding (for icon resolution) */
  sourceVid?: string | null;
  /** PID of the device that created this binding (for icon resolution) */
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
