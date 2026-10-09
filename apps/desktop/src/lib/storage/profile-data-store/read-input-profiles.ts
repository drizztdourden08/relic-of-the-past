/* @layer renderer-lib @kind logic */
import * as store from '@shared/storage/profile-data';
import { platformFiles } from '../platform-files';

const readInputProfiles = (p: string): Promise<unknown[]> => store.readInputProfiles(platformFiles(), p);

export { readInputProfiles };
