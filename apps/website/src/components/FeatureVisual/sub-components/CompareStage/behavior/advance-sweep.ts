/* @layer website-site @kind logic */
import { STEP_PER_MS, SWEEP_MAX, SWEEP_MIN } from '../CompareStage.constants';
import type { SweepState } from '../CompareStage.type';

const advanceSweep = (state: SweepState, elapsedMs: number): SweepState => {
  const raw = Math.min(Math.max(state.pos, SWEEP_MIN), SWEEP_MAX) + state.dir * STEP_PER_MS * elapsedMs;
  if (raw >= SWEEP_MAX) return { pos: SWEEP_MAX, dir: -1 };
  if (raw <= SWEEP_MIN) return { pos: SWEEP_MIN, dir: 1 };
  return { pos: raw, dir: state.dir };
};

export { advanceSweep };
