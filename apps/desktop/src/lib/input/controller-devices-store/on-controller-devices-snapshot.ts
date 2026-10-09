/* @layer renderer-lib @kind logic */
import type { DeviceEntry } from '@shared/ipc';

const onControllerDevicesSnapshot = (cb: (devices: DeviceEntry[]) => void): (() => void) =>
  window.api.onControllerDevices(cb);

export { onControllerDevicesSnapshot };
