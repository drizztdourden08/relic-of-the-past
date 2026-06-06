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

const filterGamepadCandidates = (allDevices: HID.Device[]): HID.Device[] => {
  return allDevices.filter(d => {
    if (d.vendorId === XBOX_VID) return false;
    const isGamepadUsage = GAMEPAD_USAGE_PAGES.has(d.usagePage ?? 0) &&
                           GAMEPAD_USAGES.has(d.usage ?? 0);
    return isGamepadUsage;
  });
};

const groupByVidPid = (candidates: HID.Device[]): Map<string, HID.Device[]> => {
  const groups = new Map<string, HID.Device[]>();
  for (const d of candidates) {
    const key = `${toHex4(d.vendorId)}:${toHex4(d.productId)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(d);
  }
  return groups;
};

const selectBestInterface = (interfaces: HID.Device[]): HID.Device | undefined => {
  let target = interfaces.find(d => d.usagePage === 0x01 && d.usage === 0x05);
  if (!target) target = interfaces.find(d => d.usagePage === 0x01 && d.usage === 0x04);
  if (!target) target = interfaces.find(d => d.usagePage === 0x01);
  if (!target) target = interfaces[0];
  return target;
};

export { filterGamepadCandidates, groupByVidPid, selectBestInterface };
