/* @layer renderer-lib @kind logic */
import { inputApi } from '@drizztdourden08/brock-input/renderer';
import type { DeviceSnapshotFields } from '@rotp/input-mapping';

const seedPerDeviceCache = (remember: (fields: DeviceSnapshotFields) => void): (() => void) => {
  const api = inputApi();
  api.list().then((entries) => entries.forEach(remember)).catch(() => undefined);
  const unsubSnapshot = api.onDevices((entries) => entries.forEach(remember));
  const unsubAdded = api.onAdded(remember);
  return () => {
    unsubSnapshot();
    unsubAdded();
  };
};

export { seedPerDeviceCache };
