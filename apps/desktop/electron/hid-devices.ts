/**
 * HID Device Enumeration — uses node-hid in the main process to get
 * accurate VID/PID/product name.
 *
 * This bypasses XInput virtualisation and Chromium's limited Gamepad.id.
 */

import HID from 'node-hid';

export interface HidDeviceInfo {
  vendorId: string;   // lowercase hex, 4 chars
  productId: string;  // lowercase hex, 4 chars
  product: string;    // USB product name
  manufacturer: string;
  path: string;       // OS device path (unique identifier)
  serialNumber: string | null;
  usagePage: number;
  usage: number;
}

/** VIDs that are known game controller manufacturers */
const CONTROLLER_VIDS = new Set([
  0x045e, // Microsoft (Xbox)
  0x054c, // Sony (PlayStation)
  0x057e, // Nintendo
  0x2dc8, // 8BitDo
  0x0f0d, // Hori
  0x1038, // SteelSeries
  0x046d, // Logitech
  0x28de, // Valve (Steam Controller)
  0x0738, // MadCatz
  0x1532, // Razer
  0x24c6, // PowerA
  0x20d6, // PowerA (alt)
  0x0e6f, // PDP
  0x2563, // SCUF
  0x1209, // Generic/open-source
]);

/** HID usage pages that indicate a game controller */
const GAMEPAD_USAGE_PAGES = new Set([
  0x01, // Generic Desktop (contains joystick/gamepad usages)
]);
const GAMEPAD_USAGES = new Set([
  0x04, // Joystick
  0x05, // Game Pad
  0x08, // Multi-axis Controller
]);

function toHex4(n: number): string {
  return n.toString(16).padStart(4, '0');
}

/**
 * Enumerate all connected HID devices that look like game controllers.
 * De-duplicates by VID:PID (multiple HID interfaces per physical device).
 * Accepts an optional pre-fetched device list (e.g. from a worker thread)
 * to avoid blocking the main thread with HID.devices().
 */
export function enumerateControllers(rawDevices?: HID.Device[]): HidDeviceInfo[] {
  const raw = rawDevices ?? HID.devices();
  const seen = new Map<string, HidDeviceInfo>();

  for (const d of raw) {
    const isControllerVid = CONTROLLER_VIDS.has(d.vendorId);
    const isGamepadUsage = GAMEPAD_USAGE_PAGES.has(d.usagePage ?? 0) &&
                           GAMEPAD_USAGES.has(d.usage ?? 0);

    if (!isControllerVid && !isGamepadUsage) continue;

    const key = `${toHex4(d.vendorId)}:${toHex4(d.productId)}`;

    // Prefer entries with a product name
    const existing = seen.get(key);
    if (existing && existing.product) continue;

    seen.set(key, {
      vendorId: toHex4(d.vendorId),
      productId: toHex4(d.productId),
      product: d.product || 'Unknown Controller',
      manufacturer: d.manufacturer || '',
      path: d.path ?? '',
      serialNumber: d.serialNumber || null,
      usagePage: d.usagePage ?? 0,
      usage: d.usage ?? 0,
    });
  }

  return Array.from(seen.values());
}
