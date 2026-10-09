/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { HidListedDevice } from '@shared/ipc';

const listHidDevices = (): Promise<HidListedDevice[]> => appApi().listHidDevices();

export { listHidDevices };
