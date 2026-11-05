/* @layer renderer-app @kind logic */
import { pollSync } from './poll-sync';
import { stateLoadedSet } from './state-loaded-set';

const onStateLoaded = (cb: () => void): (() => void) => {
  stateLoadedSet.add(cb);
  pollSync.rebaselinePending = true;
  return () => stateLoadedSet.delete(cb);
};

export { onStateLoaded };
