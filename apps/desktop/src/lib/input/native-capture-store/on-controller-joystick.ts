/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { ControllerJoystickSample } from '@shared/ipc';

const onControllerJoystick = (cb: (sample: ControllerJoystickSample) => void): (() => void) =>
  appApi().onControllerJoystick(cb);

export { onControllerJoystick };
