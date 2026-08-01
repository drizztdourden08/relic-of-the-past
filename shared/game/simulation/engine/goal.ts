/* @layer shared-game @kind logic */
/**
 * Terminal-condition evaluation. The `not-completable` verdict — frontier
 * exhausted with no progress since the epoch began — is the softlock signal
 * this whole tool exists to produce.
 */
import type { CheckId } from '../../data';
import type { SimOutcome } from '../types';
import type { EngineState } from './state';

/** The final-boss check. Used to be the display name 'Ganon', which only worked
 *  while exactly one check happened to carry that name. */
const DEFAULT_GOAL_CHECK: CheckId = 'check-097';

const goalCheckDone = (s: EngineState): boolean => {
  const goal = s.config.goalCheckId ?? DEFAULT_GOAL_CHECK;
  return s.completedChecks.has(goal);
};

/** All known checks done — true only when a non-empty universe is fully covered. */
const allChecksDone = (s: EngineState, totalChecks?: number): boolean =>
  totalChecks !== undefined && totalChecks > 0 && s.completedChecks.size >= totalChecks;

const frontierExhausted = (s: EngineState): boolean =>
  s.frontier.length === 0 && s.pending.length === 0 && s.route.length === 0 && !s.currentTarget;

/** Returns the terminal outcome, or null while the run can still progress. */
const evaluateOutcome = (s: EngineState, totalChecks?: number): SimOutcome | null => {
  if (s.stopHit) return 'stopped-at-check';
  // Bounded-testing cap: stop once N distinct screens have been visited across
  // the whole run (everVisited survives epoch resets; visited does not).
  if (s.config.screenLimit != null && s.everVisited.size >= s.config.screenLimit) return 'stopped-at-check';
  if (allChecksDone(s, totalChecks) || goalCheckDone(s)) return 'completed';
  if (frontierExhausted(s) && !s.progressSinceEpoch) return 'not-completable';
  return null;
};

export { evaluateOutcome, goalCheckDone, allChecksDone, frontierExhausted };
