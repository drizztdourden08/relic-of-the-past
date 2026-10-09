/* @layer bridge-wasm @kind logic */
import { getSessionState } from '../session-store';
import { runOfSession } from './run-of-session';
import type { ActiveRun } from './run-kind.type';

const currentRun = (): ActiveRun => runOfSession(getSessionState());

export { currentRun };
