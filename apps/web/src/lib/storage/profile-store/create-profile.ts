/* @layer renderer-lib @kind logic */
import type { Profile, CreateProfileOptions } from '@shared/types/profile';
import * as store from '@shared/storage/profiles';
import { platformFiles } from '../platform-files';

const createProfile = (opts: CreateProfileOptions): Promise<Profile> =>
  store.createProfile(platformFiles(), opts);

export { createProfile };
