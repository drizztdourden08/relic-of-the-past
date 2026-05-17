/**
 * Controller preset registry — lookup by VID/PID, list all, find by ID.
 *
 * This module delegates to the new registry system (register-all.ts + impl/ classes)
 * while maintaining the ControllerPreset interface for backward compatibility.
 */

import type { ControllerPreset } from '../../types/controls';
import { findController, findControllerById, getAllControllers } from './register-all';
import type { BaseController } from './base';
import { KEYBOARD_DEFAULT } from './keyboard';

/** Adapt a BaseController to the legacy ControllerPreset interface. */
function toPreset(ctrl: BaseController): ControllerPreset {
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
}

/** All registered presets (order = registry order) */
export const ALL_PRESETS: ControllerPreset[] = getAllControllers().map(toPreset);

/** Find a preset by VID:PID pair (lowercase hex, auto-pads to 4 chars) */
export function findPresetByVidPid(vid: string, pid: string): ControllerPreset | null {
  const ctrl = findController(vid, pid);
  return ctrl ? toPreset(ctrl) : null;
}

/** Find a preset by its unique ID */
export function findPresetById(id: string): ControllerPreset | null {
  if (id === 'keyboard-default') return KEYBOARD_DEFAULT;
  const ctrl = findControllerById(id);
  return ctrl ? toPreset(ctrl) : null;
}

/** Get the best-matching preset for a Gamepad.id string + mapping field */
export function resolvePreset(gamepadId: string, mapping: string): ControllerPreset {
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
}

/** Parse vendor/product IDs from Gamepad.id string.
 *  Common formats:
 *    Chrome:  "Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 02fd)"
 *    Firefox: "045e-02fd-Xbox Wireless Controller"
 */
export function parseGamepadId(id: string): { vid: string; pid: string } | null {
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
}

export { KEYBOARD_DEFAULT } from './keyboard';
