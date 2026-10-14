/* @layer renderer-components @kind logic */
import type { ControllerJoystickSample } from '@drizztdourden08/brock-input';
import { growAxisRanges } from './grow-axis-ranges';
import { isAtRest } from './is-at-rest';
import type { PositionalRefs } from './positional-capture.type';
import { widestAxis } from './widest-axis';

const detectAxisFired = (refs: PositionalRefs, baseline: ControllerJoystickSample, sample: ControllerJoystickSample): number | null => {
  refs.rangesRef.current = growAxisRanges(refs.rangesRef.current, sample);
  const candidate = widestAxis(refs.rangesRef.current);
  return candidate !== null && isAtRest(baseline, sample) ? candidate : null;
};

export { detectAxisFired };
