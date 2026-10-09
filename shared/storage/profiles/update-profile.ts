/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { Profile, ProfilePatch } from '@shared/types/profile';
import { writeJson } from '@drizztdourden08/brock-core';
import { applyProfilePatch } from '../profile-patch';
import { loadProfile } from './load-profile';
import { profileFile } from './profile-file';

const updateProfile = async (files: FileStore, id: string, patch: ProfilePatch): Promise<Profile | null> => {
  const profile = await loadProfile(files, id);
  if (!profile) return null;
  applyProfilePatch(profile, patch);
  await writeJson(files, profileFile(id), profile);
  return profile;
};

export { updateProfile };
