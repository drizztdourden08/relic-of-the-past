/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
const rescanControllerDevices = (): Promise<void> => appApi().rescanControllers();

export { rescanControllerDevices };
