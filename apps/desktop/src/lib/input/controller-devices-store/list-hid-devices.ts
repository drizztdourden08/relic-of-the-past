/* @layer renderer-lib @kind logic */
import type { HidListedDevice } from '@shared/ipc';

const listHidDevices = (): Promise<HidListedDevice[]> => window.api.listHidDevices();

export { listHidDevices };
