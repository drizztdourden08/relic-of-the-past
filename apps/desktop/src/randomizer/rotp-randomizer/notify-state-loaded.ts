/* @layer renderer-app @kind logic */
import { stateLoadedSet } from './state-loaded-set';

const notifyStateLoaded = (): void => {
  for (const cb of stateLoadedSet) cb();
};

export { notifyStateLoaded };
