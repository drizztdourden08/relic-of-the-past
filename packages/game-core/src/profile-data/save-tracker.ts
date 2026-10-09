/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { writeJson } from '@drizztdourden08/brock-core';
import { profileDataPath } from './profile-data-path';

const saveTracker = (files: FileStore, p: string, state: unknown): Promise<void> =>
  writeJson(files, profileDataPath(p, 'tracker'), state);

export { saveTracker };
