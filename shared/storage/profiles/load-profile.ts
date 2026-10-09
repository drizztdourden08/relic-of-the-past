/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { Profile } from '@shared/types/profile';
import { readJson } from '../json';
import { profileFile } from './profile-file';

const loadProfile = (files: FileStore, id: string): Promise<Profile | null> =>
  readJson<Profile | null>(files, profileFile(id), null);

export { loadProfile };
