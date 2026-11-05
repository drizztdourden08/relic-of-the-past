/* @layer bridge-wasm @kind logic */
import { getSessionState } from '../session-store';
import type { CurrentRun } from './current-run.type';
import { runOfSession } from './run-of-session';

const currentRun = (): CurrentRun => {
  const state = getSessionState();
  const kind = runOfSession(state);
  if (kind === 'seed' && state.placement !== null) return { kind: 'seed', placement: state.placement };
  return kind === 'online' ? { kind: 'online' } : { kind: 'normal' };
};

export { currentRun };
