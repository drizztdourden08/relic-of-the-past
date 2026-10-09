/* @layer renderer-lib @kind logic */
import * as store from '@shared/storage/profile-data';
import { platformFiles } from '../platform-files';

const saveTrackerState = (p: string, state: unknown): Promise<void> => store.saveTracker(platformFiles(), p, state);

export { saveTrackerState };
