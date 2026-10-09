/* @layer bridge-wasm @kind logic */
import { revisionState } from './revision-state';

const subscribeDataRevision = (listener: () => void): (() => void) => {
  revisionState.listeners.add(listener);
  return () => { revisionState.listeners.delete(listener); };
};

export { subscribeDataRevision };
