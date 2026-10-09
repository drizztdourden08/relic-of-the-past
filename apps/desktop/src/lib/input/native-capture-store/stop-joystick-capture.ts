/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
const stopJoystickCapture = (): Promise<void> => appApi().stopJoystickCapture();

export { stopJoystickCapture };
