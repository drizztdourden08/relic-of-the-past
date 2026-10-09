/* @layer renderer-components @kind logic */
import type { ControllerJoystickSample } from '@shared/ipc';
import { REST_EPSILON } from '../positional-capture.constants';

const isAtRest = (baseline: ControllerJoystickSample, current: ControllerJoystickSample): boolean => {
  for (let i = 0; i < current.buttons.length; i++) {
    if (current.buttons[i] && !baseline.buttons[i]) return false;
  }
  for (let i = 0; i < current.axes.length; i++) {
    if (Math.abs(current.axes[i] - (baseline.axes[i] ?? 0)) > REST_EPSILON) return false;
  }
  return true;
};

export { isAtRest };
