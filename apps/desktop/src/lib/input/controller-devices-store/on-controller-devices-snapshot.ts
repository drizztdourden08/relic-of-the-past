/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { DeviceEntry } from '@shared/ipc';

const onControllerDevicesSnapshot = (cb: (devices: DeviceEntry[]) => void): (() => void) =>
  appApi().onControllerDevices(cb);

export { onControllerDevicesSnapshot };
