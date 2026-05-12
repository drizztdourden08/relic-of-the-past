/**
 * Controller preset registry — lookup by VID/PID, list all, find by ID.
 */

import type { ControllerPreset } from '../../types/controls';
import { XBOX_PRESETS } from './xbox';
import { PLAYSTATION_PRESETS } from './playstation';
import { NINTENDO_PRESETS } from './nintendo';
import { GENERIC_PRESETS, GENERIC_STANDARD, GENERIC_UNKNOWN } from './generic';
import { KEYBOARD_DEFAULT } from './keyboard';

/** All registered presets (order matters — first match wins for VID/PID) */
export const ALL_PRESETS: ControllerPreset[] = [
  ...XBOX_PRESETS,
  ...PLAYSTATION_PRESETS,
  ...NINTENDO_PRESETS,
  ...GENERIC_PRESETS,
];

/** VID/PID → preset index for O(1) lookups */
const vidPidIndex = new Map<string, ControllerPreset>();
for (const preset of ALL_PRESETS) {
  for (const vid of preset.vendorIds) {
    for (const pid of preset.productIds) {
      const key = `${vid}:${pid}`;
      if (!vidPidIndex.has(key)) {
        vidPidIndex.set(key, preset);
      }
    }
  }
}

/** Find a preset by VID:PID pair (lowercase hex) */
export function findPresetByVidPid(vid: string, pid: string): ControllerPreset | null {
  return vidPidIndex.get(`${vid.toLowerCase()}:${pid.toLowerCase()}`) ?? null;
}

/** Find a preset by its unique ID */
export function findPresetById(id: string): ControllerPreset | null {
  if (id === 'keyboard-default') return KEYBOARD_DEFAULT;
  return ALL_PRESETS.find(p => p.id === id) ?? null;
}

/** Name patterns for family detection when VID/PID lookup fails */
const NAME_PATTERNS: [RegExp, ControllerPreset[]][] = [
  [/xbox|xinput/i, XBOX_PRESETS],
  [/playstation|dualshock|dualsense|ps[345]/i, PLAYSTATION_PRESETS],
  [/switch|joy-?con|nintendo|pro controller/i, NINTENDO_PRESETS],
  [/8bitdo|8bit/i, GENERIC_PRESETS],
];

/** Get the best-matching preset for a Gamepad.id string + mapping field */
export function resolvePreset(gamepadId: string, mapping: string): ControllerPreset {
  const parsed = parseGamepadId(gamepadId);
  if (parsed) {
    const match = findPresetByVidPid(parsed.vid, parsed.pid);
    if (match) return match;

    // VID-only fallback: use the first preset matching this vendor
    const vidMatch = ALL_PRESETS.find(p => p.vendorIds.includes(parsed.vid));
    if (vidMatch) return vidMatch;
  }

  // Name-based fallback: match controller name patterns
  for (const [pattern, presets] of NAME_PATTERNS) {
    if (pattern.test(gamepadId) && presets.length > 0) {
      return presets[0];
    }
  }

  // Fallback based on whether Chromium applied standard mapping
  return mapping === 'standard' ? GENERIC_STANDARD : GENERIC_UNKNOWN;
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
export { GENERIC_STANDARD, GENERIC_UNKNOWN } from './generic';
