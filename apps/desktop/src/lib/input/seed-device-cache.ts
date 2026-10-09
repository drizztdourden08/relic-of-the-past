/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
import { listControllerDevices, onControllerDevicesSnapshot } from './controller-devices-store';
import type { DeviceSnapshotFields } from './seed-device-cache.type';

const seedPerDeviceCache = (remember: (fields: DeviceSnapshotFields) => void): (() => void) => {
  listControllerDevices().then((entries) => entries.forEach(remember)).catch(() => undefined);
  const unsubSnapshot = onControllerDevicesSnapshot((entries) => entries.forEach(remember));
  const unsubAdded = appApi()?.onControllerAdded?.(remember) ?? null;
  return () => {
    unsubSnapshot();
    unsubAdded?.();
  };
};

export { seedPerDeviceCache };
export type { DeviceSnapshotFields };
