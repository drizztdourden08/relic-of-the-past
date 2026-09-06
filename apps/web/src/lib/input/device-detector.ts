/* @layer renderer-lib @kind logic */
/**
 * Turns the SDL3 controller snapshot (main process)
 * into the renderer's DetectedDevice list. SDL3 is the only controller
 * transport on every platform now (the browser Gamepad API path is gone,
 * see the platform hosts), so a device is either an SDL entry or the
 * keyboard; there is no separate "activation" concept left to track.
 */

import type { DetectedDevice, DeviceFamily } from '@shared/types/controls';
import type { DeviceEntry } from '@shared/ipc';
import { KEYBOARD_DEFAULT } from '@shared/input';
import { resolveDeviceFromEntry } from './resolve-device';

const toHex4 = (n: number): string => n.toString(16).padStart(4, '0');

const detectFromEntry = (entry: DeviceEntry): DetectedDevice => {
  const vendorId = toHex4(entry.vendorId);
  const productId = toHex4(entry.productId);

  // Name and family are display concerns, resolved the same way the
  // calibration cards and controls screen do: from SDL's own report through
  // the family layer (resolve-device.ts), never from a preset or database guess.
  const resolved = resolveDeviceFromEntry(entry);

  return {
    id: `hid-${vendorId}-${productId}`,
    type: 'gamepad',
    rawId: entry.product,
    vendorId,
    productId,
    deviceFamily: (resolved.brandLogoKey || 'generic') as DeviceFamily,
    displayName: resolved.name,
    sdlType: entry.sdlType ?? 'unknown',
    connected: entry.status === 'ready',
    // Every SDL-claimed device reads directly, with no button-press
    // activation step (that was only ever needed for the Gamepad API).
    activated: true,
    brandLogoKey: resolved.brandLogoKey || null,
    inputApi: 'hid',
    hasRumble: entry.hasRumble ?? false,
    hasGyro: entry.hasGyro ?? false,
  };
};

const detectKeyboard = (index = 0): DetectedDevice => {
  return {
    id: `keyboard-${index}`,
    type: 'keyboard',
    rawId: 'Standard Keyboard',
    vendorId: null,
    productId: null,
    deviceFamily: 'keyboard',
    displayName: 'Keyboard',
    // Not a real SDL type, since SDL never enumerates a keyboard, but a stable,
    // truthy sentinel so the drag-and-drop "apply defaults" flow can tell
    // this card apart from a gamepad's sdlType without a separate flag.
    sdlType: 'keyboard',
    connected: true,
    activated: true, // keyboard is always activated
    brandLogoKey: 'keyboard',
    inputApi: 'webapi',
    hasRumble: false,
    hasGyro: false,
  };
};

const detectAllDevices = (deviceEntries?: DeviceEntry[]): DetectedDevice[] => {
  const devices: DetectedDevice[] = [detectKeyboard(0)];
  if (!deviceEntries) return devices;

  for (const entry of deviceEntries) {
    // Filter out mice and other non-controller devices
    const name = (entry.product || '').toLowerCase();
    if (name.includes('mouse') || name.includes('trackpad') || name.includes('touchpad')) continue;
    devices.push(detectFromEntry(entry));
  }

  return devices;
};

export { detectAllDevices, detectKeyboard };
