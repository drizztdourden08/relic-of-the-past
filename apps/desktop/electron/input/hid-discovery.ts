/**
 * HID device discovery — filtering and selection of gamepad HID interfaces.
 */

import type HID from 'node-hid';
import {
  XBOX_VID,
  GAMEPAD_USAGE_PAGES,
  GAMEPAD_USAGES,
  toHex4,
} from './hid-constants';

/**
 * Filter HID device list to gamepad-like interfaces, excluding Xbox.
 * Requires gamepad usage (page=0x01, usage=0x04/0x05/0x08) to avoid
 * opening mice/keyboards from manufacturers that also make controllers.
 */
function filterGamepadCandidates(allDevices: HID.Device[]): HID.Device[] {
  return allDevices.filter(d => {
    if (d.vendorId === XBOX_VID) return false;
    const isGamepadUsage = GAMEPAD_USAGE_PAGES.has(d.usagePage ?? 0) &&
                           GAMEPAD_USAGES.has(d.usage ?? 0);
    return isGamepadUsage;
  });
}

/** Group candidate devices by VID:PID key. */
function groupByVidPid(candidates: HID.Device[]): Map<string, HID.Device[]> {
  const groups = new Map<string, HID.Device[]>();
  for (const d of candidates) {
    const key = `${toHex4(d.vendorId)}:${toHex4(d.productId)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(d);
  }
  return groups;
}

/**
 * Select the best HID interface from a group of interfaces for the same device.
 * Prefers usagePage=0x01 usage=0x05 (Game Pad), then 0x04 (Joystick), then any 0x01.
 */
function selectBestInterface(interfaces: HID.Device[]): HID.Device | undefined {
  let target = interfaces.find(d => d.usagePage === 0x01 && d.usage === 0x05);
  if (!target) target = interfaces.find(d => d.usagePage === 0x01 && d.usage === 0x04);
  if (!target) target = interfaces.find(d => d.usagePage === 0x01);
  if (!target) target = interfaces[0];
  return target;
}

export { filterGamepadCandidates, groupByVidPid, selectBestInterface };
