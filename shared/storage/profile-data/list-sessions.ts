/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { PlaySession } from '@shared/types/session';
import { readJson } from '@drizztdourden08/brock-core';
import { profileDataPath } from './profile-data-path';

const listSessions = async (files: FileStore, p: string): Promise<PlaySession[]> =>
  (await readJson<PlaySession[]>(files, profileDataPath(p, 'sessions'), [])).sort((a, b) => b.startedAt - a.startedAt);

export { listSessions };
