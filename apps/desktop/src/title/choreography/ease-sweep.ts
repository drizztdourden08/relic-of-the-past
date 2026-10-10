/* @layer renderer-hud @kind logic */
import { CURVE_STEPS } from './logo-sweep.constants';
import { itemAt } from '@app/checked-access';
import { SWEEP_CURVE } from './sweep-curve.constants';

const easeSweep = (u: number): number => {
  const at = Math.min(CURVE_STEPS - 1, Math.floor(u * CURVE_STEPS));
  const frac = u * CURVE_STEPS - at;
  const from = itemAt(SWEEP_CURVE, at);
  return from + (itemAt(SWEEP_CURVE, at + 1) - from) * frac;
};

export { easeSweep };
