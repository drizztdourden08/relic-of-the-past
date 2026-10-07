/* @layer electron-main @kind logic */
/**
 * Builds the controller device snapshot for `controller:list` and
 * `controller:devices`. It holds every SDL-claimed device plus anything the
 * device lister sees that SDL hasn't claimed (see device-availability.ts).
 *
 * Takes `listed` as a parameter because `listDevices()` is a synchronous native
 * HID enumeration (~10ms), so sdl3-source.ts caches it across snapshot builds.
 */
import { classifyDevices } from './device-availability';
import { toVidPid } from './sdl3-device-key';
import type { ListedDevice } from './device-lister.type';
import type { ControllerConnectionState, ControllerGamepadType, DeviceEntry } from '@shared/ipc/controller-contract';

/** The live-device fields sdl3-source.ts tracks per connected joystick. */
interface LiveDevice {
  deviceKey: string;
  /** SDL's own name. In the snapshot because the connect event fires once and
   *  is missed by anything that subscribes later or after a release. */
  name: string;
  sdlId: number;
  vendorId: number;
  productId: number;
  guid: string;
  /** The gamecontrollerdb mapping line for `guid`, resolved once on add: it
   *  never changes while connected, so no native lookup per snapshot. */
  mapping: string | null;
  hasRumble: boolean;
  hasGyro: boolean;
  connectionState: ControllerConnectionState;
  sdlType: ControllerGamepadType;
  hasButton: boolean[];
  hasAxis: boolean[];
  buttonLabels: string[];
}

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

/** `live`: every SDL-claimed device by deviceKey. `listed`: the caller's cached HID listing. */
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
