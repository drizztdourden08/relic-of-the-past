/* @layer renderer-components @kind logic */
import type { ControllerJoystickSample } from '@drizztdourden08/brock-input';
import type { AxisRanges } from '../positional-capture.type';

const startAxisRanges = (sample: ControllerJoystickSample): AxisRanges =>
  sample.axes.map((v) => ({ min: v, max: v }));

export { startAxisRanges };
