/* @layer renderer-lib @kind logic */
import type { Profile } from '@shared/types/profile';
import * as store from '@shared/storage/profiles';
import { platformFiles } from '../platform-files';

const listProfiles = (): Promise<Profile[]> => store.listProfiles(platformFiles());

export { listProfiles };
