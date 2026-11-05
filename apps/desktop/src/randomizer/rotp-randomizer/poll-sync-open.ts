/* @layer renderer-app @kind logic */
import { pollSync } from './poll-sync';
import { stateLoadedSet } from './state-loaded-set';

const pollSyncOpen = (): boolean => stateLoadedSet.size === 0 || pollSync.rebaselinePending;

export { pollSyncOpen };
