/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { PlaySession } from '@shared/types/session';
import { readJson } from '../json';
import { profileDataPath } from './profile-data-path';

const listSessions = async (files: FileStore, p: string): Promise<PlaySession[]> =>
  (await readJson<PlaySession[]>(files, profileDataPath(p, 'sessions'), [])).sort((a, b) => b.startedAt - a.startedAt);

export { listSessions };
