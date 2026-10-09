/* @layer bridge-wasm @kind logic */
import { stateLoadSignalState } from './state-load-signal-state';

const onStateLoaded = (listener: () => void): (() => void) => {
  stateLoadSignalState.listeners.add(listener);
  return () => { stateLoadSignalState.listeners.delete(listener); };
};

export { onStateLoaded };
