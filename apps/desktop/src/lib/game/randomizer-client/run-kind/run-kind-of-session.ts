/* @layer bridge-wasm @kind logic */
import { runOfSession } from './run-of-session';
import type { RunKind } from '@shared/game/logic';
import type { SessionStoreState } from '../session-store';

const runKindOfSession = (state: SessionStoreState): RunKind => runOfSession(state).kind;

export { runKindOfSession };
