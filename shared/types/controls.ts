// ── SNES Buttons ──

export const SNES_BUTTONS = [
  'A', 'B', 'X', 'Y', 'L', 'R',
  'Start', 'Select',
  'Up', 'Down', 'Left', 'Right',
] as const;

export type SnesButton = (typeof SNES_BUTTONS)[number];

/** Bitmask positions matching emscripten_main.c g_input1_state */
export const SNES_BUTTON_BITS: Record<SnesButton, number> = {
  B:      0,
  Y:      1,
  Select: 2,
  Start:  3,
  Up:     4,
  Down:   5,
  Left:   6,
  Right:  7,
  A:      8,
  X:      9,
  L:      10,
  R:      11,
};

/** Human-readable SNES button names (Nintendo layout) */
export const SNES_BUTTON_LABELS: Record<SnesButton, string> = {
  A: 'A Button',
  B: 'B Button',
  X: 'X Button',
  Y: 'Y Button',
  L: 'L Bumper',
  R: 'R Bumper',
  Start: 'Start',
  Select: 'Select',
  Up: 'D-Pad Up',
  Down: 'D-Pad Down',
  Left: 'D-Pad Left',
  Right: 'D-Pad Right',
};

/** Game action labels — what each SNES button does in ALttP */
export const SNES_ACTION_LABELS: Record<SnesButton, string> = {
  A: 'Interact',
  B: 'Sword',
  X: 'Map',
  Y: 'Item Use',
  L: 'Prev Item',
  R: 'Next Item',
  Start: 'Pause',
  Select: 'Select',
  Up: 'Move Up',
  Down: 'Move Down',
  Left: 'Move Left',
  Right: 'Move Right',
};

// ── Controller families (for icon sets) ──

export type DeviceFamily =
  | 'xbox'
  | 'playstation'
  | 'nintendo'
  | '8bitdo'
  | 'keyboard'
  | 'generic';

/**
 * Which input API a controller uses for actual button/axis reading:
 *  - 'xinput': Windows XInput driver (Xbox controllers) — read via Web Gamepad API
 *  - 'hid':    Raw HID reports via node-hid (Switch, PlayStation, 8BitDo)
 *  - 'webapi': Web Gamepad API only (fallback for unknowns that Chromium maps)
 */
export type InputApi = 'xinput' | 'hid' | 'webapi';

// ── Input bindings ──

export interface NoneBinding {
  type: 'none';
}

export interface KeyboardBinding {
  type: 'keyboard';
  code: string;       // KeyboardEvent.code, e.g. "KeyZ", "ArrowUp"
  label?: string;     // Display override, e.g. "Z"
  modifiers?: {
    shift?: boolean;
    ctrl?: boolean;
    alt?: boolean;
  };
}

export interface GamepadButtonBinding {
  type: 'gamepad-button';
  index: number;      // Standard Gamepad button index (0-16)
  label?: string;
}

export interface GamepadAxisBinding {
  type: 'gamepad-axis';
  axisIndex: number;  // 0-3
  direction: '+' | '-';
  label?: string;
}

export type InputBinding = NoneBinding | KeyboardBinding | GamepadButtonBinding | GamepadAxisBinding;

// ── Button icon reference ──

export interface ButtonIcon {
  key: string;          // e.g. "xbox-a", "ps-cross", "switch-b"
  path: string | null;  // asset path — null until icons are provided
  label: string;        // text fallback: "A", "✕", "B"
}

// ── Per-button mapping ──

export interface ButtonMapping {
  snesButton: SnesButton;
  binding: InputBinding;
  icon: ButtonIcon | null; // null = no icon shown, layout unchanged
  /** VID of the device that created this binding (for icon resolution) */
  sourceVid?: string | null;
  /** PID of the device that created this binding (for icon resolution) */
  sourcePid?: string | null;
}

// ── Input profile (persisted per-profile) ──

export interface InputProfile {
  id: string;
  name: string;
  deviceType: 'gamepad' | 'keyboard';
  deviceFamily: DeviceFamily;
  mappings: ButtonMapping[];
  isDefault: boolean;  // Factory preset (non-deletable) vs user-created
  assignedDevice: AssignedDevice | null;
  createdAt: number;
  modifiedAt: number;
}

// ── Detected device at runtime (not persisted) ──

export interface DetectedDevice {
  id: string;               // Unique runtime ID (e.g. "gamepad-0", "keyboard-0")
  type: 'gamepad' | 'keyboard';
  rawId: string;            // Gamepad.id string or "Standard Keyboard"
  vendorId: string | null;
  productId: string | null;
  deviceFamily: DeviceFamily;
  displayName: string;      // Resolved: "Xbox Series X|S Controller"
  presetId: string | null;  // Matched preset ID, null if unknown
  connected: boolean;       // HID-level connected (physical presence)
  activated: boolean;       // Web Gamepad API active (button pressed at least once)
  stale: boolean;           // No HID reports received for >2s (device locked up)
  brandLogoKey: string | null;
  inputApi: InputApi;       // Which API this controller uses for input reading
}

// ── Assigned device info (persisted with profile) ──

export interface AssignedDevice {
  vendorId: string;
  productId: string;
  displayName: string;
  deviceFamily: DeviceFamily;
  presetId: string | null;
}

// ── Device preset (ships with the app) ──

export interface DevicePreset {
  id: string;
  name: string;
  family: DeviceFamily;
  /** Which input API to use for reading this device */
  inputApi: InputApi;
  /** VID hex strings (lowercase) this preset matches */
  vendorIds: string[];
  /** PID hex strings (lowercase) this preset matches */
  productIds: string[];
  defaultMappings: ButtonMapping[];
  brandLogoKey: string | null;
  /** Icon set for this device family */
  buttonIcons: Partial<Record<string, ButtonIcon>>;
}

// ── Function Actions (Shortcuts & Cheats) ──

export const SHORTCUT_ACTIONS = [
  'save-state-1', 'save-state-2', 'save-state-3', 'save-state-4',
  'save-state-5', 'save-state-6', 'save-state-7', 'save-state-8',
  'save-state-9', 'save-state-10', 'save-state-11', 'save-state-12',
  'load-state-1', 'load-state-2', 'load-state-3', 'load-state-4',
  'load-state-5', 'load-state-6', 'load-state-7', 'load-state-8',
  'load-state-9', 'load-state-10', 'load-state-11', 'load-state-12',
  'pause', 'reset',
  'fullscreen', 'turbo',
] as const;

export const CHEAT_ACTIONS = [
  'cheat-health', 'cheat-equipment', 'cheat-keys', 'cheat-noclip',
] as const;

export const FUNCTION_ACTIONS = [...SHORTCUT_ACTIONS, ...CHEAT_ACTIONS] as const;

export type FunctionAction = (typeof FUNCTION_ACTIONS)[number];

export const FUNCTION_ACTION_LABELS: Record<FunctionAction, string> = {
  'save-state-1': 'Save State 1',
  'save-state-2': 'Save State 2',
  'save-state-3': 'Save State 3',
  'save-state-4': 'Save State 4',
  'save-state-5': 'Save State 5',
  'save-state-6': 'Save State 6',
  'save-state-7': 'Save State 7',
  'save-state-8': 'Save State 8',
  'save-state-9': 'Save State 9',
  'save-state-10': 'Save State 10',
  'save-state-11': 'Save State 11',
  'save-state-12': 'Save State 12',
  'load-state-1': 'Load State 1',
  'load-state-2': 'Load State 2',
  'load-state-3': 'Load State 3',
  'load-state-4': 'Load State 4',
  'load-state-5': 'Load State 5',
  'load-state-6': 'Load State 6',
  'load-state-7': 'Load State 7',
  'load-state-8': 'Load State 8',
  'load-state-9': 'Load State 9',
  'load-state-10': 'Load State 10',
  'load-state-11': 'Load State 11',
  'load-state-12': 'Load State 12',
  'pause': 'Pause',
  'reset': 'Reset',
  'fullscreen': 'Fullscreen',
  'turbo': 'Turbo',
  'cheat-health': 'Restore Health',
  'cheat-equipment': 'Restore Equipment',
  'cheat-keys': 'Give All Keys',
  'cheat-noclip': 'Walk Through Walls',
};

export interface FunctionMapping {
  action: FunctionAction;
  binding: InputBinding;
  icon: ButtonIcon | null;
  sourceVid?: string | null;
  sourcePid?: string | null;
}

export const DEFAULT_FUNCTION_MAPPINGS: FunctionMapping[] = [
  { action: 'save-state-1', binding: { type: 'keyboard', code: 'F1', modifiers: { shift: true } }, icon: null },
  { action: 'save-state-2', binding: { type: 'keyboard', code: 'F2', modifiers: { shift: true } }, icon: null },
  { action: 'save-state-3', binding: { type: 'keyboard', code: 'F3', modifiers: { shift: true } }, icon: null },
  { action: 'save-state-4', binding: { type: 'keyboard', code: 'F4', modifiers: { shift: true } }, icon: null },
  { action: 'save-state-5', binding: { type: 'none' }, icon: null },
  { action: 'save-state-6', binding: { type: 'none' }, icon: null },
  { action: 'save-state-7', binding: { type: 'none' }, icon: null },
  { action: 'save-state-8', binding: { type: 'none' }, icon: null },
  { action: 'save-state-9', binding: { type: 'none' }, icon: null },
  { action: 'save-state-10', binding: { type: 'none' }, icon: null },
  { action: 'save-state-11', binding: { type: 'none' }, icon: null },
  { action: 'save-state-12', binding: { type: 'none' }, icon: null },
  { action: 'load-state-1', binding: { type: 'keyboard', code: 'F1' }, icon: null },
  { action: 'load-state-2', binding: { type: 'keyboard', code: 'F2' }, icon: null },
  { action: 'load-state-3', binding: { type: 'keyboard', code: 'F3' }, icon: null },
  { action: 'load-state-4', binding: { type: 'keyboard', code: 'F4' }, icon: null },
  { action: 'load-state-5', binding: { type: 'none' }, icon: null },
  { action: 'load-state-6', binding: { type: 'none' }, icon: null },
  { action: 'load-state-7', binding: { type: 'none' }, icon: null },
  { action: 'load-state-8', binding: { type: 'none' }, icon: null },
  { action: 'load-state-9', binding: { type: 'none' }, icon: null },
  { action: 'load-state-10', binding: { type: 'none' }, icon: null },
  { action: 'load-state-11', binding: { type: 'none' }, icon: null },
  { action: 'load-state-12', binding: { type: 'none' }, icon: null },
  { action: 'pause', binding: { type: 'keyboard', code: 'F10' }, icon: null },
  { action: 'reset', binding: { type: 'keyboard', code: 'KeyR', modifiers: { ctrl: true } }, icon: null },
  { action: 'fullscreen', binding: { type: 'keyboard', code: 'Enter', modifiers: { alt: true } }, icon: null },
  { action: 'turbo', binding: { type: 'keyboard', code: 'Tab' }, icon: null },
  { action: 'cheat-health', binding: { type: 'keyboard', code: 'KeyW' }, icon: null },
  { action: 'cheat-equipment', binding: { type: 'keyboard', code: 'KeyW', modifiers: { shift: true } }, icon: null },
  { action: 'cheat-keys', binding: { type: 'keyboard', code: 'KeyO' }, icon: null },
  { action: 'cheat-noclip', binding: { type: 'keyboard', code: 'KeyE', modifiers: { ctrl: true } }, icon: null },
];
