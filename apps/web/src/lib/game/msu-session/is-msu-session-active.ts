/* @layer bridge-wasm @kind logic */
import { msuSessionState } from './msu-session-state';

const isMsuSessionActive = (): boolean => msuSessionState.engine !== null;

export { isMsuSessionActive };
