/* @layer renderer-other @kind logic */
/**
 * Builds the DeviceEntry snapshot ('controller:list' / 'controller:devices'
 * shape, see shared/ipc/controller-contract.ts) for Android's SDL3
 * transport. Every entry here is 'ready': unlike the desktop transport,
 * this plugin has no separate raw HID enumeration to report a device SDL
 * could not claim, so there is no 'unavailable' half of the snapshot to
 * build: every device this store knows about is one SDL currently has open.
 */
import type { ControllerConnectionState, ControllerGamepadType, DeviceEntry } from '@shared/ipc';

/** The live-device fields controller-sdl3-store.ts tracks per connected joystick. */
interface LiveDevice {
  deviceKey: string;
  sdlId: number;
  /** SDL's own name for the device, carried in the snapshot rather than left
   *  to the connect event, which fires once and is missed by a listener that
   *  subscribes later. */
  name: string;
  vendorId: number;
  productId: number;
  guid: string;
  hasRumble: boolean;
  hasGyro: boolean;
  connectionState: ControllerConnectionState;
  sdlType: ControllerGamepadType;
  hasButton: boolean[];
  hasAxis: boolean[];
  buttonLabels: string[];
}

const buildAndroidSnapshot = (live: ReadonlyMap<string, LiveDevice>): DeviceEntry[] =>
  Array.from(live.values()).map((device) => ({
    deviceKey: device.deviceKey,
    vendorId: device.vendorId,
    productId: device.productId,
    name: device.name,
    // No separate raw-HID product string exists on this platform; SDL's own
    // name is the closest equivalent and is what the device list actually shows.
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
