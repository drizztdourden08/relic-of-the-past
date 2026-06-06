/**
 * Gamepad VID/PID Resolution — heuristic matching of Web Gamepad API
 * controllers to their HID vendor/product IDs using available HID cache data.
 */

import { parseGamepadId } from '@shared/input';

interface HidDeviceInfo {
  vendorId: string;
  productId: string;
  product: string;
  manufacturer: string;
  path: string;
  serialNumber: string | null;
}

const resolveGamepadVidPid = (gp: Gamepad, hidDeviceCache: HidDeviceInfo[], alreadyMapped: Set<string>): { vid: string; pid: string } | null => {
  const parsed = parseGamepadId(gp.id);
  if (parsed && parsed.vid !== '0000') {
    return {
      vid: parsed.vid.toLowerCase().padStart(4, '0'),
      pid: parsed.pid.toLowerCase().padStart(4, '0'),
    };
  }

  const idLower = gp.id.toLowerCase();

  // Try to match by known brand keywords
  for (const hid of hidDeviceCache) {
    const hidName = (hid.product || '').toLowerCase();
    const hidMfg = (hid.manufacturer || '').toLowerCase();
    if ((idLower.includes('xbox') || idLower.includes('xinput')) &&
        (hidName.includes('xbox') || hidMfg.includes('microsoft') || hid.vendorId.toLowerCase().padStart(4, '0') === '045e')) {
      return {
        vid: hid.vendorId.toLowerCase().padStart(4, '0'),
        pid: hid.productId.toLowerCase().padStart(4, '0'),
      };
    }
    if ((idLower.includes('dualshock') || idLower.includes('dualsense') || idLower.includes('playstation')) &&
        (hidName.includes('dual') || hidMfg.includes('sony') || hid.vendorId.toLowerCase().padStart(4, '0') === '054c')) {
      return {
        vid: hid.vendorId.toLowerCase().padStart(4, '0'),
        pid: hid.productId.toLowerCase().padStart(4, '0'),
      };
    }
  }

  // Fallback: if exactly one unmatched HID device exists, assume it's this gamepad
  const unmatchedHid = hidDeviceCache.filter(h => {
    const key = `${h.vendorId.toLowerCase().padStart(4, '0')}:${h.productId.toLowerCase().padStart(4, '0')}`;
    if (alreadyMapped.has(key)) return false;
    const name = (h.product || '').toLowerCase();
    return !name.includes('mouse') && !name.includes('keyboard') && !name.includes('trackpad');
  });
  if (unmatchedHid.length === 1) {
    return {
      vid: unmatchedHid[0].vendorId.toLowerCase().padStart(4, '0'),
      pid: unmatchedHid[0].productId.toLowerCase().padStart(4, '0'),
    };
  }

  return null;
};

export { resolveGamepadVidPid };
export type { HidDeviceInfo };
