/* @layer electron-main @kind logic */
import type { ListedDevice } from './device-lister.type';
import type { ClassifiedDevice } from './device-availability.type';

const toVidPidKey = (vendorId: number, productId: number): string =>
  `${vendorId.toString(16).padStart(4, '0')}:${productId.toString(16).padStart(4, '0')}`;

const classifyDevices = (listed: readonly ListedDevice[], claimedVidPids: ReadonlySet<string>): ClassifiedDevice[] =>
  listed.map((device) => ({
    ...device,
    status: claimedVidPids.has(toVidPidKey(device.vendorId, device.productId)) ? 'ready' : 'unavailable',
  }));

export { classifyDevices };
export type { ClassifiedDevice };
