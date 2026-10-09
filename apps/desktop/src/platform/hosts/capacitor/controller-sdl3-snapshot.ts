/* @layer renderer-other @kind logic */
import type { DeviceEntry } from '@shared/ipc';
import type { LiveDevice } from './controller-sdl3.type';

const buildAndroidSnapshot = (live: ReadonlyMap<string, LiveDevice>): DeviceEntry[] =>
  Array.from(live.values()).map((device) => ({
    deviceKey: device.deviceKey,
    vendorId: device.vendorId,
    productId: device.productId,
    name: device.name,
    product: device.name,
    busType: 'unknown',
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
  }));

export { buildAndroidSnapshot };
export type { LiveDevice };
