/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { DeviceEntry } from '@shared/ipc';

const listControllerDevices = (): Promise<DeviceEntry[]> => appApi().listControllers();

export { listControllerDevices };
