/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { writeJson } from '../json';
import { profileDataPath } from './profile-data-path';

const saveRandomizer = (files: FileStore, p: string, placement: unknown): Promise<void> =>
  writeJson(files, profileDataPath(p, 'randomizer'), placement);

export { saveRandomizer };
