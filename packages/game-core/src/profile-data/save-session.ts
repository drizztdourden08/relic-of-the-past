/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { PlaySession } from '../session-types';
import { readJson, writeJson } from '@drizztdourden08/brock-core';
import { MAX_SESSIONS } from './profile-data.constants';
import { profileDataPath } from './profile-data-path';

const saveSession = async (files: FileStore, p: string, session: PlaySession): Promise<void> => {
  const path = profileDataPath(p, 'sessions');
  const sessions = await readJson<PlaySession[]>(files, path, []);
  sessions.push(session);
  await writeJson(files, path, sessions.slice(-MAX_SESSIONS));
};

export { saveSession };
