/* @layer bridge-wasm @kind logic */
import { stateLoadSignalState } from './state-load-signal-state';

const notifyListener = (listener: () => void): void => {
  try {
    listener();
  } catch {
    
  }
};

const markStateLoaded = (): void => {
  stateLoadSignalState.lastLoadAt = Date.now();
  for (const listener of stateLoadSignalState.listeners) notifyListener(listener);
};

export { markStateLoaded };
