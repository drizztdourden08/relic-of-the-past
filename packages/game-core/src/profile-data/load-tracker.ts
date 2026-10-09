/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { readJson } from '@drizztdourden08/brock-core';
import { profileDataPath } from './profile-data-path';

const loadTracker = (files: FileStore, p: string): Promise<unknown> =>
  readJson<unknown>(files, profileDataPath(p, 'tracker'), null);

export { loadTracker };
