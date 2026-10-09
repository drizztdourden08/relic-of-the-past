/* @layer shared-game @kind logic */
import type { DetectedCheck } from '../../types';
import type { EngineState } from '../state/state.type';

const markDoneAndContinue = (state: EngineState, check: DetectedCheck): void => {
  if (check.checkId) state.completedChecks.add(check.checkId);
  state.progressSinceEpoch = true;
};

export { markDoneAndContinue };
