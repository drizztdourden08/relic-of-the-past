/* @layer renderer-app @kind logic */
import { pollSync } from './poll-sync';
import { stateLoadedSet } from './state-loaded-set';

const notifyStateLoaded = (): void => {
  pollSync.rebaselinePending = true;
  for (const listener of [...stateLoadedSet]) listener();
};

export { notifyStateLoaded };
