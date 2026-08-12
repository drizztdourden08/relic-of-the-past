/* @layer electron-main @kind logic */
/**
 * Selects which DeviceLister(s) feed the controller device snapshot. This
 * is the ONE place that decision is made — nothing else should call the
 * lister directly. SDL's own enumeration is the sole source now that the
 * node-hid fallback (once needed to cover a hidapi listing gap) has been
 * removed.
 */
import { listDevicesViaSdl } from './device-lister-sdl';
import type { DeviceLister, ListedDevice } from './device-lister.type';

const ACTIVE_LISTERS: readonly DeviceLister[] = [listDevicesViaSdl];

const toVidPidKey = (device: ListedDevice): string =>
  `${device.vendorId.toString(16).padStart(4, '0')}:${device.productId.toString(16).padStart(4, '0')}`;

/** Union of every active lister's devices, deduped by vid:pid — the first
 *  lister to report a given vid:pid wins. */
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
