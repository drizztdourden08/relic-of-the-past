/* @layer electron-main @kind logic */
/**
 * Builds the full controller device snapshot for `controller:list` /
 * `controller:devices` — every SDL-claimed device plus anything the device
 * lister sees that SDL hasn't claimed (see device-availability.ts).
 *
 * Takes `listed` as a parameter rather than calling the device lister itself:
 * `listDevices()` bottoms out in a synchronous native HID enumeration
 * (measured ~10ms on a 2-device machine), so the caller (sdl3-source.ts)
 * owns a cache of it and refreshes only on connect/disconnect/rescan rather
 * than once per snapshot build.
 */
import { classifyDevices } from './device-availability';
import { toVidPid } from './sdl3-device-key';
import type { ListedDevice } from './device-lister.type';
import type { ControllerConnectionState, ControllerGamepadType, DeviceEntry } from '@shared/ipc/controller-contract';

/** The live-device fields sdl3-source.ts tracks per connected joystick. */
interface LiveDevice {
  deviceKey: string;
  /** SDL's own name for the device. Carried in the snapshot rather than left
   *  to the connect event, which fires once and is missed by anything that
   *  subscribes later or after a deliberate release. */
  name: string;
  sdlId: number;
  vendorId: number;
  productId: number;
  guid: string;
  /** The gamecontrollerdb mapping line for `guid`, resolved once when the
   *  device was added. A mapping line for a connected GUID never changes, so
   *  this replaces a native `mappingForGuid` lookup on every snapshot build. */
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

/** `live` — every currently SDL-claimed device, keyed by its deviceKey.
 *  `listed` — the caller's cached OS-level HID listing (see the module doc). */
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
