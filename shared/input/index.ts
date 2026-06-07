/* @layer shared-input @kind logic */
/**
 * Input device preset registry — lookup by VID/PID, list all, find by ID.
 */

import type { DevicePreset } from '../types/controls';
import { findController, findControllerById, getAllControllers } from './register-all';
import type { BaseController, ControllerButton, ControllerAxis } from './base';
import { KEYBOARD_DEFAULT } from './data/presets/keyboard';

const toPreset = (ctrl: BaseController): DevicePreset => {
  return {
    id: ctrl.id,
    name: ctrl.name,
    family: ctrl.family,
    inputApi: ctrl.inputApi,
    vendorIds: ctrl.vendorIds,
    productIds: ctrl.productIds,
    defaultMappings: ctrl.defaultMappings,
    brandLogoKey: ctrl.brandLogoKey,
    buttonIcons: ctrl.buttonIcons,
  };
};

/** All registered presets (order = registry order) */
const ALL_PRESETS: DevicePreset[] = getAllControllers().map(toPreset);

const findPresetByVidPid = (vid: string, pid: string): DevicePreset | null => {
  const ctrl = findController(vid, pid);
  return ctrl ? toPreset(ctrl) : null;
};

const findPresetById = (id: string): DevicePreset | null => {
  if (id === 'keyboard-default') return KEYBOARD_DEFAULT;
  const ctrl = findControllerById(id);
  return ctrl ? toPreset(ctrl) : null;
};

const resolvePreset = (gamepadId: string, mapping: string): DevicePreset => {
  const parsed = parseGamepadId(gamepadId);
  if (parsed) {
    const match = findPresetByVidPid(parsed.vid, parsed.pid);
    if (match) return match;
  }

  // Name-based fallback
  const NAME_PATTERNS: [RegExp, string][] = [
    [/xbox|xinput/i, 'xbox'],
    [/playstation|dualshock|dualsense|ps[345]/i, 'playstation'],
    [/switch|joy-?con|nintendo|pro controller/i, 'nintendo'],
    [/8bitdo|8bit/i, '8bitdo'],
  ];

  for (const [pattern, family] of NAME_PATTERNS) {
    if (pattern.test(gamepadId)) {
      const ctrl = getAllControllers().find(c => c.family === family);
      if (ctrl) return toPreset(ctrl);
    }
  }

  // Fallback: generic controller (always last in registry)
  const generic = findControllerById('generic');
  return generic ? toPreset(generic) : toPreset(getAllControllers()[getAllControllers().length - 1]);
};

const parseGamepadId = (id: string): { vid: string; pid: string } | null => {
  // Chrome format: "Vendor: XXXX Product: XXXX"
  const chromeMatch = id.match(/Vendor:\s*([0-9a-fA-F]{4})\s+Product:\s*([0-9a-fA-F]{4})/);
  if (chromeMatch) {
    return { vid: chromeMatch[1].toLowerCase(), pid: chromeMatch[2].toLowerCase() };
  }
  // Firefox format: "XXXX-XXXX-Name"
  const ffMatch = id.match(/^([0-9a-fA-F]{1,4})-([0-9a-fA-F]{1,4})-/);
  if (ffMatch) {
    return {
      vid: ffMatch[1].padStart(4, '0').toLowerCase(),
      pid: ffMatch[2].padStart(4, '0').toLowerCase(),
    };
  }
  return null;
};

export { KEYBOARD_DEFAULT } from './data/presets/keyboard';

// ── Device Profile (replaces legacy profiles/ adapter) ──

interface DeviceProfileButton {
  id: string;
  label: string;
  icon: string;
  category: 'face' | 'shoulder' | 'trigger' | 'dpad' | 'stick' | 'system';
}

interface DeviceProfileAxis {
  id: string;
  label: string;
  category: 'stick' | 'trigger';
}

interface DeviceProfile {
  id: string;
  name: string;
  vendorId: string | null;
  productId: string | null;
  family: string;
  inputApi: string;
  buttons: DeviceProfileButton[];
  axes: DeviceProfileAxis[];
  supportsVibration: boolean;
}

const toDeviceProfile = (ctrl: BaseController): DeviceProfile => {
  return {
    id: ctrl.id,
    name: ctrl.name,
    vendorId: ctrl.vendorIds[0] ?? null,
    productId: ctrl.productIds[0] ?? null,
    family: ctrl.family,
    inputApi: ctrl.inputApi,
    buttons: ctrl.buttons.map((b: ControllerButton) => ({
      id: b.id,
      label: b.label,
      icon: b.icon,
      category: b.category,
    })),
    axes: ctrl.axes.map((a: ControllerAxis) => ({
      id: a.id,
      label: a.label,
      category: a.category,
    })),
    supportsVibration: ctrl.supportsVibration(),
  };
};

/** All registered device profiles */
const DEVICE_PROFILES: DeviceProfile[] = getAllControllers().map(toDeviceProfile);

const findDeviceProfileByVidPid = (vid: string, pid: string): DeviceProfile | null => {
  const ctrl = findController(vid, pid);
  return ctrl ? toDeviceProfile(ctrl) : null;
};

const findDeviceProfileById = (id: string): DeviceProfile | null => {
  const ctrl = getAllControllers().find(c => c.id === id);
  return ctrl ? toDeviceProfile(ctrl) : null;
};

export {
  ALL_PRESETS,
  DEVICE_PROFILES,
  findDeviceProfileById,
  findDeviceProfileByVidPid,
  findPresetById,
  findPresetByVidPid,
  parseGamepadId,
  resolvePreset
};
export type { DeviceProfile, DeviceProfileAxis, DeviceProfileButton };
export * from './haptics';
