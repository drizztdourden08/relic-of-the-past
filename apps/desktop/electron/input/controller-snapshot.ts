/* @layer electron-main @kind logic */
import { classifyDevices } from './device-availability';
import { toVidPid } from './sdl3-device-key';
import type { ListedDevice } from './device-lister.type';
import type { DeviceEntry } from '@shared/ipc/controller-contract';
import type { LiveDevice } from './controller-snapshot.type';

const findListed = (listed: readonly ListedDevice[], vendorId: number, productId: number): ListedDevice | undefined =>
  listed.find((d) => d.vendorId === vendorId && d.productId === productId);

const readyEntry = (device: LiveDevice, listed: readonly ListedDevice[]): DeviceEntry => {
  const match = findListed(listed, device.vendorId, device.productId);
  return {
    deviceKey: device.deviceKey,
    vendorId: device.vendorId,
    productId: device.productId,
    name: device.name,
    mapping: device.mapping ?? undefined,
    product: match?.product ?? '',
    busType: match?.busType ?? 'unknown',
    status: 'ready',
    sdlId: device.sdlId,
    guid: device.guid,
    hasRumble: device.hasRumble,
    hasGyro: device.hasGyro,
    connectionState: device.connectionState,
    sdlType: device.sdlType,
    hasButton: device.hasButton,
    hasAxis: device.hasAxis,
    buttonLabels: device.buttonLabels,
  };
};

const unavailableEntry = (device: ListedDevice): DeviceEntry => ({
  deviceKey: toVidPid(device.vendorId, device.productId),
  vendorId: device.vendorId,
  productId: device.productId,
  product: device.product,
  busType: device.busType,
  status: 'unavailable',
});

const buildDeviceSnapshot = (live: ReadonlyMap<string, LiveDevice>, listed: readonly ListedDevice[]): DeviceEntry[] => {
  const claimedVidPids = new Set(Array.from(live.values()).map((d) => toVidPid(d.vendorId, d.productId)));
  const classified = classifyDevices(listed, claimedVidPids);

  const readyEntries = Array.from(live.values()).map((device) => readyEntry(device, listed));
  const unavailableEntries = classified
    .filter((device) => device.status === 'unavailable')
    .map(unavailableEntry);

  return [...readyEntries, ...unavailableEntries];
};

export { buildDeviceSnapshot };
export type { LiveDevice };
