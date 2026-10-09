/* @layer renderer-lib @kind logic */
import type { DetectedDevice } from '@shared/types/controls';
import type { DeviceEntry } from '@shared/ipc';
import { detectFromEntry } from './detect-from-entry';
import { detectKeyboard } from './detect-keyboard';

const isPointingDevice = (entry: DeviceEntry): boolean => {
  const name = (entry.product || '').toLowerCase();
  return name.includes('mouse') || name.includes('trackpad') || name.includes('touchpad');
};

const detectAllDevices = (deviceEntries?: DeviceEntry[]): DetectedDevice[] => {
  const devices: DetectedDevice[] = [detectKeyboard(0)];
  if (!deviceEntries) return devices;

  for (const entry of deviceEntries) {
    if (isPointingDevice(entry)) continue;
    devices.push(detectFromEntry(entry));
  }

  return devices;
};

export { detectAllDevices };
