/* @layer renderer-hud @kind logic */
import { CURVE_STEPS } from './logo-sweep.constants';
import { SWEEP_CURVE } from './sweep-curve.constants';

const easeSweep = (u: number): number => {
  const at = Math.min(CURVE_STEPS - 1, Math.floor(u * CURVE_STEPS));
  const frac = u * CURVE_STEPS - at;
  return SWEEP_CURVE[at] + (SWEEP_CURVE[at + 1] - SWEEP_CURVE[at]) * frac;
};

export { easeSweep };
