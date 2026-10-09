/* @layer renderer-components @kind logic */
import type { ControllerJoystickSample } from '@shared/ipc';
import type { PositionalTarget } from '../positional-capture.type';

const trimTargetsToDevice = (targets: PositionalTarget[], sample: ControllerJoystickSample): PositionalTarget[] =>
  targets.filter((t) => t.kind === 'axis' || t.expectedIndex === null || t.expectedIndex < sample.buttons.length);

export { trimTargetsToDevice };
