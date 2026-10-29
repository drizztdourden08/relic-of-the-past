/* @layer website-site @kind logic */
import { LEG_MS, SWEEP_HOLD_MS } from '../CompareStage.constants';
import type { SweepState } from '../CompareStage.type';

const advanceSweep = (state: SweepState, elapsedMs: number): SweepState => {
  if (state.hold > 0) return { ...state, hold: Math.max(state.hold - elapsedMs, 0) };
  const progress = state.progress + elapsedMs / LEG_MS;
  if (progress < 1) return { ...state, progress };
  return { progress: 0, dir: state.dir === 1 ? -1 : 1, hold: SWEEP_HOLD_MS };
};

export { advanceSweep };
