/* @layer renderer-lib @kind logic */
import type { DeviceEntry } from '@shared/ipc';

const listControllerDevices = (): Promise<DeviceEntry[]> => window.api.listControllers();

export { listControllerDevices };
