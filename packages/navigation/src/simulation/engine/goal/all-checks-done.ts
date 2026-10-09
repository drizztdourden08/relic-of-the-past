/* @layer shared-game @kind logic */
import type { EngineState } from '../state/state.type';

const allChecksDone = (s: EngineState, totalChecks?: number): boolean =>
  totalChecks !== undefined && totalChecks > 0 && s.completedChecks.size >= totalChecks;

export { allChecksDone };
