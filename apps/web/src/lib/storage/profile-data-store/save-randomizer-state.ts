/* @layer renderer-lib @kind logic */
import * as store from '@shared/storage/profile-data';
import { platformFiles } from '../platform-files';

const saveRandomizerState = (p: string, placement: unknown): Promise<void> => store.saveRandomizer(platformFiles(), p, placement);

export { saveRandomizerState };
