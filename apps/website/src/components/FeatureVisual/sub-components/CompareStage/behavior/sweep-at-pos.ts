/* @layer website-site @kind logic */
import { SWEEP_MAX, SWEEP_MIN } from '../CompareStage.constants';
import type { SweepState } from '../CompareStage.type';

const sweepAtPos = (pos: number, dir: 1 | -1): SweepState => {
  const share = Math.min(Math.max((pos - SWEEP_MIN) / (SWEEP_MAX - SWEEP_MIN), 0), 1);
  const along = Math.acos(1 - 2 * share) / Math.PI;
  return { progress: dir === 1 ? along : 1 - along, dir, hold: 0 };
};

export { sweepAtPos };
