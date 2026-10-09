/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { writeJson } from '../json';
import { profileDataPath } from './profile-data-path';

const saveTracker = (files: FileStore, p: string, state: unknown): Promise<void> =>
  writeJson(files, profileDataPath(p, 'tracker'), state);

export { saveTracker };
