/* @layer shared-types @kind types */
import type { ButtonIcon, ButtonMapping, DeviceFamily, InputApi } from './bindings';

// ── Input profile (persisted per-profile) ──

interface InputProfile {
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

interface DetectedDevice {
  id: string;               // Unique runtime ID (e.g. "gamepad-0", "keyboard-0")
  type: 'gamepad' | 'keyboard';
  rawId: string;            // Gamepad.id string or "Standard Keyboard"
  vendorId: string | null;
  productId: string | null;
  deviceFamily: DeviceFamily;
  displayName: string;      // Resolved: "Xbox Series X|S Controller"
  /** SDL's own gamepad type (shared/input/sdl-buttons SdlGamepadType), kept a plain string so
   *  this file does not depend on shared/input. The keyboard entry uses the sentinel
   *  'keyboard', never null. */
  sdlType: string | null;
  connected: boolean;       // HID-level connected (physical presence)
  activated: boolean;       // Web Gamepad API active (button pressed at least once)
  brandLogoKey: string | null;
  inputApi: InputApi;       // Which API this controller uses for input reading
  /** Real capability reported by SDL3 (controller:added); false, not unknown, when this
   *  device wasn't detected through that surface. */
  hasRumble: boolean;
  hasGyro: boolean;
}

// ── Assigned device info (persisted with profile) ──

interface AssignedDevice {
  vendorId: string;
  productId: string;
  displayName: string;
  deviceFamily: DeviceFamily;
}

// ── Device preset (ships with the app) ──

interface DevicePreset {
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

export type { AssignedDevice, DetectedDevice, DevicePreset, InputProfile };
