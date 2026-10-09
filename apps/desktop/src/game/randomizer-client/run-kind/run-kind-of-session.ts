/* @layer bridge-wasm @kind logic */
import { runOfSession } from './run-of-session';
import type { RunKind } from '@rotp/game-data';
import type { SessionStoreState } from '../session-store';

const runKindOfSession = (state: SessionStoreState): RunKind => runOfSession(state).kind;

export { runKindOfSession };
