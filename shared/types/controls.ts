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

/** Human-readable labels for display */
export const SNES_BUTTON_LABELS: Record<SnesButton, string> = {
  A: 'A (Action)',
  B: 'B (Sword)',
  X: 'X (Map)',
  Y: 'Y (Item)',
  L: 'L Bumper',
  R: 'R Bumper',
  Start: 'Start',
  Select: 'Select',
  Up: 'D-Pad Up',
  Down: 'D-Pad Down',
  Left: 'D-Pad Left',
  Right: 'D-Pad Right',
};

// ── Controller families (for icon sets) ──

export type ControllerFamily =
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

export interface KeyboardBinding {
  type: 'keyboard';
  code: string;       // KeyboardEvent.code, e.g. "KeyZ", "ArrowUp"
  label?: string;     // Display override, e.g. "Z"
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

export type InputBinding = KeyboardBinding | GamepadButtonBinding | GamepadAxisBinding;

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
}

// ── Input profile (persisted per-profile) ──

export interface InputProfile {
  id: string;
  name: string;
  deviceType: 'gamepad' | 'keyboard';
  controllerFamily: ControllerFamily;
  mappings: ButtonMapping[];
  isDefault: boolean;  // Factory preset (non-deletable) vs user-created
  assignedController: AssignedController | null;
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
  controllerFamily: ControllerFamily;
  displayName: string;      // Resolved: "Xbox Series X|S Controller"
  presetId: string | null;  // Matched preset ID, null if unknown
  connected: boolean;       // HID-level connected (physical presence)
  activated: boolean;       // Web Gamepad API active (button pressed at least once)
  brandLogoKey: string | null;
  inputApi: InputApi;       // Which API this controller uses for input reading
}

// ── Assigned controller info (persisted with profile) ──

export interface AssignedController {
  vendorId: string;
  productId: string;
  displayName: string;
  controllerFamily: ControllerFamily;
  presetId: string | null;
}

// ── Controller preset (ships with the app) ──

export interface ControllerPreset {
  id: string;
  name: string;
  family: ControllerFamily;
  /** Which input API to use for reading this controller */
  inputApi: InputApi;
  /** VID hex strings (lowercase) this preset matches */
  vendorIds: string[];
  /** PID hex strings (lowercase) this preset matches */
  productIds: string[];
  defaultMappings: ButtonMapping[];
  brandLogoKey: string | null;
  /** Icon set for this controller family */
  buttonIcons: Partial<Record<string, ButtonIcon>>;
}
