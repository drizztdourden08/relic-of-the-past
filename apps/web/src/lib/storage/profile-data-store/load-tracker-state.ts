/* @layer renderer-lib @kind logic */
import * as store from '@shared/storage/profile-data';
import { platformFiles } from '../platform-files';

const loadTrackerState = (p: string): Promise<unknown> => store.loadTracker(platformFiles(), p);

export { loadTrackerState };
