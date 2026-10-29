/* @layer website-site @kind logic */
import { SWEEP_MAX, SWEEP_MIN } from '../CompareStage.constants';
import type { SweepState } from '../CompareStage.type';

const posOfSweep = (state: SweepState): number => {
  const along = state.dir === 1 ? state.progress : 1 - state.progress;
  const eased = (1 - Math.cos(Math.PI * along)) / 2;
  return SWEEP_MIN + (SWEEP_MAX - SWEEP_MIN) * eased;
};

export { posOfSweep };
