/* @layer renderer-lib @kind logic */
import { store } from '@rotp/game-core';
import { platformFiles } from '../platform-files';

const loadTrackerState = (p: string): Promise<unknown> => store.loadTracker(platformFiles(), p);

export { loadTrackerState };
