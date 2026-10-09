/* @layer shared-game @kind logic */
import type { EngineState } from '../state/state.type';
import { DEFAULT_GOAL_CHECK } from './goal.constants';

const goalCheckDone = (s: EngineState): boolean => {
  const goal = s.config.goalCheckId ?? DEFAULT_GOAL_CHECK;
  return s.completedChecks.has(goal);
};

export { goalCheckDone };
