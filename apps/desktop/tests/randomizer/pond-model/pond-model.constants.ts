/* @layer tests @kind constants */
import type { CurveId, PondSetting } from '@rotp/randomizer';

const CUSTOM: Extract<PondSetting, { mode: 'custom' }> = {
  mode: 'custom', start: 100, max: 300, throws: 5, items: 3, shape: { curve: 'equal' },
};

const LONGEST_FITTING_LINE = 63;

const CURVES: readonly CurveId[] = ['equal', 'front', 'ramp', 'reverse-fib', 'geometric'];

export { CURVES, CUSTOM, LONGEST_FITTING_LINE };
