/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { Profile, ProfilePatch } from '@shared/types/profile';
import { writeJson } from '../json';
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
