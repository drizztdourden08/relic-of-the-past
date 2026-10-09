/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
const startJoystickCapture = (joystickId: number): Promise<boolean> =>
  appApi().startJoystickCapture(joystickId);

export { startJoystickCapture };
