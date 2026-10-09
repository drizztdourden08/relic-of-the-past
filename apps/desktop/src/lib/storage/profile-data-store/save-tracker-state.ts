/* @layer renderer-lib @kind logic */
import { store } from '@rotp/game-core';
import { platformFiles } from '../platform-files';

const saveTrackerState = (p: string, state: unknown): Promise<void> => store.saveTracker(platformFiles(), p, state);

export { saveTrackerState };
