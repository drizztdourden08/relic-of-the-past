/* @layer renderer-app @kind logic */
import { stateLoadedSet } from './state-loaded-set';

const notifyStateLoaded = (): void => {
  for (const listener of [...stateLoadedSet]) listener();
};

export { notifyStateLoaded };
