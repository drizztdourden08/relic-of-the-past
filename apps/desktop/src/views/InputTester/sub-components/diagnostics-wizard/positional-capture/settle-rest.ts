/* @layer renderer-components @kind logic */
import type { ControllerJoystickSample } from '@drizztdourden08/brock-input';
import { isAtRest } from './is-at-rest';
import type { PositionalRefs } from './positional-capture.type';
import { startAxisRanges } from './start-axis-ranges';

const settleRest = (refs: PositionalRefs, baseline: ControllerJoystickSample, sample: ControllerJoystickSample): void => {
  if (!isAtRest(baseline, sample)) return;
  refs.awaitingRestRef.current = false;
  refs.baselineRef.current = sample;
  refs.rangesRef.current = startAxisRanges(sample);
};

export { settleRest };
