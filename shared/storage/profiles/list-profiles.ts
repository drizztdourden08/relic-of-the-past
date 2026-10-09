/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { Profile } from '@shared/types/profile';
import { readJson } from '@drizztdourden08/brock-core';
import { profileFile } from './profile-file';

const listProfiles = async (files: FileStore): Promise<Profile[]> => {
  const ids = await files.list('profiles');
  const profiles: Profile[] = [];
  for (const id of ids) {
    const profile = await readJson<Profile | null>(files, profileFile(id), null);
    if (profile) profiles.push(profile);
  }
  return profiles.sort((a, b) => b.lastPlayed - a.lastPlayed);
};

export { listProfiles };
