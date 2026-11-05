/* @layer renderer-app @kind logic */
import { stateLoadedSet } from './state-loaded-set';

const pollSync = { rebaselinePending: false };

const pollSyncOpen = (): boolean => stateLoadedSet.size === 0 || pollSync.rebaselinePending;

export { pollSync, pollSyncOpen };
