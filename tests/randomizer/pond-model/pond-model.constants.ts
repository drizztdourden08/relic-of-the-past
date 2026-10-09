/* @layer tests @kind constants */
import type { CurveId } from '@shared/randomizer/world/capacity/capacity-profile.type';
import type { PondSetting } from '@shared/randomizer/world/pond/pond-profile.type';

const CUSTOM: PondSetting = {
  mode: 'custom', start: 100, max: 300, throws: 5, items: 3, shape: { curve: 'equal' },
};

const LONGEST_FITTING_LINE = 63;

const CURVES: readonly CurveId[] = ['equal', 'front', 'ramp', 'reverse-fib', 'geometric'];

export { CURVES, CUSTOM, LONGEST_FITTING_LINE };
