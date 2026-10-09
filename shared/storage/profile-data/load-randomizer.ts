/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { readJson } from '../json';
import { profileDataPath } from './profile-data-path';

const loadRandomizer = (files: FileStore, p: string): Promise<unknown> =>
  readJson<unknown>(files, profileDataPath(p, 'randomizer'), null);

export { loadRandomizer };
