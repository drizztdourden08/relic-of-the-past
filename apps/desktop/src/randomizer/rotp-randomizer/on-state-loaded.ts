/* @layer renderer-app @kind logic */
import { stateLoadedSet } from './state-loaded-set';

const onStateLoaded = (cb: () => void): (() => void) => {
  stateLoadedSet.add(cb);
  return () => stateLoadedSet.delete(cb);
};

export { onStateLoaded };
