/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
const stopRawCapture = (): Promise<void> => appApi().stopControllerRawCapture();

export { stopRawCapture };
