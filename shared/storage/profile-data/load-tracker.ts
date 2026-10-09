/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { readJson } from '../json';
import { profileDataPath } from './profile-data-path';

const loadTracker = (files: FileStore, p: string): Promise<unknown> =>
  readJson<unknown>(files, profileDataPath(p, 'tracker'), null);

export { loadTracker };
