/* @layer electron-main @kind logic */
import { ACTIVE_LISTERS } from './device-lister.constants';
import type { ListedDevice } from './device-lister.type';

const toVidPidKey = (device: ListedDevice): string =>
  `${device.vendorId.toString(16).padStart(4, '0')}:${device.productId.toString(16).padStart(4, '0')}`;

const listDevices = (): ListedDevice[] => {
  const seen = new Map<string, ListedDevice>();
  for (const lister of ACTIVE_LISTERS) {
    for (const device of lister()) {
      const key = toVidPidKey(device);
      if (!seen.has(key)) seen.set(key, device);
    }
  }
  return Array.from(seen.values());
};

export { listDevices };
