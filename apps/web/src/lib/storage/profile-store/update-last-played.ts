/* @layer renderer-lib @kind logic */
import * as store from '@shared/storage/profiles';
import { platformFiles } from '../platform-files';

const updateLastPlayed = (id: string): Promise<void> => store.updateLastPlayed(platformFiles(), id);

export { updateLastPlayed };
