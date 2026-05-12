/**
 * Controller Detection — merges node-hid (main process) for accurate
 * device identification with Web Gamepad API for activation status.
 *
 * HID enumeration gives us correct VID/PID/product names without requiring
 * a button press. The Web Gamepad API tells us which controllers are
 * "activated" (user has pressed at least one button).
 */

import type { DetectedDevice, InputApi } from '@shared/types/controls';
import { resolvePreset, parseGamepadId, findPresetByVidPid, KEYBOARD_DEFAULT } from '@shared/data/controllers';

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
function detectFromHid(hid: HidDeviceInfo, index: number, activated: boolean): DetectedDevice {
  const preset = findPresetByVidPid(hid.vendorId, hid.productId);

  return {
    id: `hid-${hid.vendorId}-${hid.productId}`,
    type: 'gamepad',
    rawId: hid.product,
    vendorId: hid.vendorId,
    productId: hid.productId,
    controllerFamily: preset?.family ?? 'generic',
    displayName: preset?.name ?? hid.product,
    presetId: preset?.id ?? null,
    connected: true,
    activated,
    brandLogoKey: preset?.brandLogoKey ?? null,
    inputApi: preset?.inputApi ?? 'webapi',
  };
}

/**
 * Build a DetectedDevice from a Web Gamepad API Gamepad object.
 * Only available after the user presses a button.
 */
export function detectGamepad(gp: Gamepad): DetectedDevice {
  const preset = resolvePreset(gp.id, gp.mapping);
  const parsed = parseGamepadId(gp.id);

  return {
    id: `gamepad-${gp.index}`,
    type: 'gamepad',
    rawId: gp.id,
    vendorId: parsed?.vid ?? null,
    productId: parsed?.pid ?? null,
    controllerFamily: preset.family,
    displayName: preset.name,
    presetId: preset.id,
    connected: gp.connected,
    activated: true, // if it's in the Web API, it's activated
    brandLogoKey: preset.brandLogoKey,
    inputApi: preset.inputApi,
  };
}

/**
 * Build a DetectedDevice for a keyboard.
 */
export function detectKeyboard(index = 0): DetectedDevice {
  return {
    id: `keyboard-${index}`,
    type: 'keyboard',
    rawId: 'Standard Keyboard',
    vendorId: null,
    productId: null,
    controllerFamily: 'keyboard',
    displayName: 'Keyboard',
    presetId: KEYBOARD_DEFAULT.id,
    connected: true,
    activated: true, // keyboard is always activated
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
export function markActivated(index: number): void {
  activatedIndices.add(index);
}

/** Also check current input state as a fallback (e.g. if event was missed). */
export function updateActivationState(): void {
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
export function detectAllDevices(hidDevices?: HidDeviceInfo[]): DetectedDevice[] {
  const devices: DetectedDevice[] = [];

  // Always include keyboard
  devices.push(detectKeyboard(0));

  const activated = hasAnyActivation();

  if (hidDevices && hidDevices.length > 0) {
    // Primary: use HID for detection, merge activation status from Web API
    for (let i = 0; i < hidDevices.length; i++) {
      devices.push(detectFromHid(hidDevices[i], i, activated));
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

