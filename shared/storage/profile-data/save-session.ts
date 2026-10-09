/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { PlaySession } from '@shared/types/session';
import { readJson, writeJson } from '../json';
import { MAX_SESSIONS } from './profile-data.constants';
import { profileDataPath } from './profile-data-path';

const saveSession = async (files: FileStore, p: string, session: PlaySession): Promise<void> => {
  const path = profileDataPath(p, 'sessions');
  const sessions = await readJson<PlaySession[]>(files, path, []);
  sessions.push(session);
  await writeJson(files, path, sessions.slice(-MAX_SESSIONS));
};

export { saveSession };
