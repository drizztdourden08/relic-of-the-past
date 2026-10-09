/* @layer renderer-lib @kind logic */
import type { ControllerJoystickSample } from '@shared/ipc';

const onControllerJoystick = (cb: (sample: ControllerJoystickSample) => void): (() => void) =>
  window.api.onControllerJoystick(cb);

export { onControllerJoystick };
