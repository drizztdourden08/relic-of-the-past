/* @layer renderer-components @kind logic */
import type { ControllerJoystickSample } from '@drizztdourden08/brock-input';
import { REST_EPSILON } from '../positional-capture.constants';

const isAtRest = (baseline: ControllerJoystickSample, current: ControllerJoystickSample): boolean => {
  for (let i = 0; i < current.buttons.length; i++) {
    if (current.buttons[i] && !baseline.buttons[i]) return false;
  }
  for (const [i, axis] of current.axes.entries()) {
    if (Math.abs(axis - (baseline.axes[i] ?? 0)) > REST_EPSILON) return false;
  }
  return true;
};

export { isAtRest };
