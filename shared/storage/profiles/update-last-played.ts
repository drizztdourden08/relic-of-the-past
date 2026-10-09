/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { writeJson } from '../json';
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
