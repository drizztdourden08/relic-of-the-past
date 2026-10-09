/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { Profile } from '@app/profiles/types';
import { readJson } from '@drizztdourden08/brock-core';
import { profileFile } from './profile-file';

const loadProfile = (files: FileStore, id: string): Promise<Profile | null> =>
  readJson<Profile | null>(files, profileFile(id), null);

export { loadProfile };
