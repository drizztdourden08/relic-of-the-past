/* @layer renderer-lib @kind logic */
import { useProfilesStore } from '@drizztdourden08/brock-react';
import type { CreateProfileOptions, Profile } from '@drizztdourden08/brock-core';

const createProfile = (opts: CreateProfileOptions): Promise<Profile> => useProfilesStore.getState().create(opts);

export { createProfile };
