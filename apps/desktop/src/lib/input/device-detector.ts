/**
 * Controller Detection — merges node-hid (main process) for accurate
 * device identification with Web Gamepad API for activation status.
 *
 * HID enumeration gives us correct VID/PID/product names without requiring
 * a button press. The Web Gamepad API tells us which controllers are
 * "activated" (user has pressed at least one button).
 */

import type { DetectedDevice, InputApi } from '@shared/types/controls';
import { resolvePreset, parseGamepadId, findPresetByVidPid, KEYBOARD_DEFAULT } from '@shared/input';
import { DEVICE_DATABASE } from '@shared/input/data/devices';

interface HidDeviceInfo {
  vendorId: string;
  productId: string;
  product: string;
  manufacturer: string;
  path: string;
  serialNumber: string | null;
}

/**
 * Build a DetectedDevice from HID info (main process).
 * No button press needed — always detects connected devices.
 */
function detectFromHid(hid: HidDeviceInfo, index: number, webApiActivated: boolean): DetectedDevice {
  const preset = findPresetByVidPid(hid.vendorId, hid.productId);
  // If a device was found via HID enumeration, it should use HID by default.
  // Only Xbox (xinput) controllers need the Gamepad API since Windows claims exclusive HID access.
  // The generic fallback has inputApi='webapi' which is wrong for HID-enumerated devices.
  const isGenericFallback = preset?.id === 'generic';
  const api = preset?.inputApi === 'xinput' ? 'xinput'
    : isGenericFallback ? 'hid'
    : (preset?.inputApi ?? 'hid');

  // HID-api controllers are always activated (direct HID reading, no button press needed).
  // XInput controllers need a button press to appear in navigator.getGamepads().
  const activated = api === 'xinput' ? webApiActivated : true;

  // Resolve display name: specific preset > SDL database > HID product string
  const sdlName = isGenericFallback
    ? DEVICE_DATABASE.find(e => e.vidPid === `${hid.vendorId}:${hid.productId}`)?.name
    : undefined;
  const displayName = (!isGenericFallback && preset?.name) || sdlName || hid.product;

  return {
    id: `hid-${hid.vendorId}-${hid.productId}`,
    type: 'gamepad',
    rawId: hid.product,
    vendorId: hid.vendorId,
    productId: hid.productId,
    deviceFamily: preset?.family ?? 'generic',
    displayName,
    presetId: preset?.id ?? null,
    connected: true,
    activated,
    stale: false,
    brandLogoKey: preset?.brandLogoKey ?? null,
    inputApi: api,
  };
}

/**
 * Build a DetectedDevice from a Web Gamepad API Gamepad object.
 * Only available after the user presses a button.
 */
function detectGamepad(gp: Gamepad): DetectedDevice {
  const preset = resolvePreset(gp.id, gp.mapping);
  const parsed = parseGamepadId(gp.id);

  return {
    id: `gamepad-${gp.index}`,
    type: 'gamepad',
    rawId: gp.id,
    vendorId: parsed?.vid ?? null,
    productId: parsed?.pid ?? null,
    deviceFamily: preset.family,
    displayName: preset.name,
    presetId: preset.id,
    connected: gp.connected,
    activated: true, // if it's in the Web API, it's activated
    stale: false,
    brandLogoKey: preset.brandLogoKey,
    inputApi: preset.inputApi,
  };
}

/**
 * Build a DetectedDevice for a keyboard.
 */
function detectKeyboard(index = 0): DetectedDevice {
  return {
    id: `keyboard-${index}`,
    type: 'keyboard',
    rawId: 'Standard Keyboard',
    vendorId: null,
    productId: null,
    deviceFamily: 'keyboard',
    displayName: 'Keyboard',
    presetId: KEYBOARD_DEFAULT.id,
    connected: true,
    activated: true, // keyboard is always activated
    stale: false,
    brandLogoKey: 'keyboard',
    inputApi: 'webapi',
  };
}

/**
 * Track which gamepad indices have been activated (received gamepadconnected event).
 * In Chromium, gamepadconnected fires on first button press — that IS the activation signal.
 */
const activatedIndices = new Set<number>();

/** Mark a gamepad index as activated. Call from gamepadconnected handler. */
function markActivated(index: number): void {
  activatedIndices.add(index);
}

/** Also check current input state as a fallback (e.g. if event was missed). */
function updateActivationState(): void {
  const gamepads = navigator.getGamepads();
  for (const gp of gamepads) {
    if (!gp || !gp.connected) continue;
    // If a gamepad is visible in navigator.getGamepads(), the user already
    // pressed a button at some point (Chromium won't show it otherwise).
    // Mark it as activated unconditionally.
    activatedIndices.add(gp.index);
  }
}

/**
 * Check if at least one gamepad has been activated (user pressed a button).
 * We don't try to match VIDs between Gamepad API and HID — the ID format
 * is unreliable across Chromium versions (XInput often omits Vendor/Product).
 */
function hasAnyActivation(): boolean {
  return activatedIndices.size > 0;
}

/**
 * Snapshot all devices: HID devices (always visible) merged with
 * Web Gamepad API activation state.
 *
 * @param hidDevices — from window.api.enumerateHidDevices()
 */
function detectAllDevices(hidDevices?: HidDeviceInfo[]): DetectedDevice[] {
  const devices: DetectedDevice[] = [];

  // Always include keyboard
  devices.push(detectKeyboard(0));

  const activated = hasAnyActivation();

  if (hidDevices && hidDevices.length > 0) {
    // Primary: use HID for detection, merge activation status from Web API
    for (let i = 0; i < hidDevices.length; i++) {
      const hid = hidDevices[i];
      // Filter out mice and other non-controller HID devices
      const name = (hid.product || '').toLowerCase();
      if (name.includes('mouse') || name.includes('trackpad') || name.includes('touchpad')) continue;
      devices.push(detectFromHid(hid, i, activated));
    }
  } else {
    // Fallback: Web Gamepad API only (requires button press)
    const gamepads = navigator.getGamepads();
    for (const gp of gamepads) {
      if (gp && gp.connected) {
        devices.push(detectGamepad(gp));
      }
    }
  }

  return devices;
}

export {
  detectAllDevices,
  detectGamepad,
  detectKeyboard,
  markActivated,
  updateActivationState
};
