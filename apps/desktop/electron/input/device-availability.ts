/* @layer electron-main @kind logic */
/**
 * Classifies listed devices as available or not. SDL claims a device by
 * opening it, so any listed device whose vid:pid isn't among the ones SDL
 * currently has open is 'unavailable' — held by another application, or
 * filtered out by SDL's own hidapi rules (see device-lister-sdl.ts).
 *
 * Pure and I/O-free by design, so it stays trivial to unit test: it only
 * classifies data handed to it, never reaches for a lister or the addon
 * itself.
 */
import type { ListedDevice } from './device-lister.type';
import type { DeviceStatus } from '@shared/ipc/controller-contract';

interface ClassifiedDevice extends ListedDevice {
  status: DeviceStatus;
}

const toVidPidKey = (vendorId: number, productId: number): string =>
  `${vendorId.toString(16).padStart(4, '0')}:${productId.toString(16).padStart(4, '0')}`;

/** `claimedVidPids` — the vid:pid of every device SDL currently has open. */
const classifyDevices = (listed: readonly ListedDevice[], claimedVidPids: ReadonlySet<string>): ClassifiedDevice[] =>
  listed.map((device) => ({
    ...device,
    status: claimedVidPids.has(toVidPidKey(device.vendorId, device.productId)) ? 'ready' : 'unavailable',
  }));

export { classifyDevices, toVidPidKey };
export type { ClassifiedDevice };
