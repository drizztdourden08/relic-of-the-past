/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { writeJson } from '@drizztdourden08/brock-core';
import { loadProfile } from './load-profile';
import { profileFile } from './profile-file';

const updateLastPlayed = async (files: FileStore, id: string): Promise<void> => {
  const profile = await loadProfile(files, id);
  if (profile) {
    profile.lastPlayed = Date.now();
    await writeJson(files, profileFile(id), profile);
  }
};

export { updateLastPlayed };
