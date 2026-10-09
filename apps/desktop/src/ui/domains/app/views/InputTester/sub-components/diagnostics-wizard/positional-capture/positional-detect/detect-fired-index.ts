/* @layer renderer-components @kind logic */
import type { ControllerJoystickSample } from '@drizztdourden08/brock-input';
import { AXIS_FIRED_THRESHOLD } from '../positional-capture.constants';
import type { PositionalTarget } from '../positional-capture.type';

const detectFiredIndex = (
  target: PositionalTarget,
  baseline: ControllerJoystickSample,
  current: ControllerJoystickSample,
): number | null => {
  if (target.kind === 'button') {
    for (let i = 0; i < current.buttons.length; i++) {
      if (current.buttons[i] && !baseline.buttons[i]) return i;
    }
    return null;
  }
  for (let i = 0; i < current.axes.length; i++) {
    const base = baseline.axes[i] ?? 0;
    if (Math.abs(current.axes[i] - base) >= AXIS_FIRED_THRESHOLD) return i;
  }
  return null;
};

export { detectFiredIndex };
