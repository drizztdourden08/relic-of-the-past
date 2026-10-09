/* @layer renderer-lib @kind logic */
import type { Profile, ProfilePatch } from '@shared/types/profile';
import * as store from '@shared/storage/profiles';
import { platformFiles } from '../platform-files';

const updateProfile = (id: string, patch: ProfilePatch): Promise<Profile | null> => store.updateProfile(platformFiles(), id, patch);

export { updateProfile };
