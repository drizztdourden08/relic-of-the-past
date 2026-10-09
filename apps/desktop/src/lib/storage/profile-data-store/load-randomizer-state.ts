/* @layer renderer-lib @kind logic */
import * as store from '@shared/storage/profile-data';
import { platformFiles } from '../platform-files';

const loadRandomizerState = (p: string): Promise<unknown> => store.loadRandomizer(platformFiles(), p);

export { loadRandomizerState };
