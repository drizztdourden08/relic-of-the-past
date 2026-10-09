/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { writeJson } from '@drizztdourden08/brock-core';
import { profileDataPath } from './profile-data-path';

const writeInputProfiles = (files: FileStore, p: string, profiles: unknown[]): Promise<void> =>
  writeJson(files, profileDataPath(p, 'input-profiles'), profiles);

export { writeInputProfiles };
