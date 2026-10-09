/* @layer shared-game @kind logic */
import type { SimOutcome } from '../../types';
import type { EngineState } from '../state/state.type';
import { allChecksDone } from './all-checks-done';
import { frontierExhausted } from './frontier-exhausted';
import { goalCheckDone } from './goal-check-done';

const screenLimitReached = (s: EngineState): boolean =>
  s.config.screenLimit != null && s.everVisited.size >= s.config.screenLimit;

const evaluateOutcome = (s: EngineState, totalChecks?: number): SimOutcome | null => {
  if (s.stopHit) return 'stopped-at-check';
  if (screenLimitReached(s)) return 'stopped-at-check';
  if (allChecksDone(s, totalChecks) || goalCheckDone(s)) return 'completed';
  if (frontierExhausted(s) && !s.progressSinceEpoch) return 'not-completable';
  return null;
};

export { evaluateOutcome };
