/* @layer bridge-wasm @kind logic */
import { stateLoadSignalState } from './state-load-signal-state';

const wasStateJustLoaded = (windowMs: number): boolean => Date.now() - stateLoadSignalState.lastLoadAt < windowMs;

export { wasStateJustLoaded };
