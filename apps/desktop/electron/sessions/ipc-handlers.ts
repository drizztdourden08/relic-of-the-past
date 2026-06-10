/* @layer electron-main @kind logic */
import { handle } from '../lib/ipc/handle';
import { getUserDataPath } from '../lib/paths';
import { readJson, writeJson } from '../lib/json-store';
import type { PlaySession } from '@shared/types/session';

const MAX_SESSIONS = 100;

const sessionsPath = (profileId: string): string =>
  getUserDataPath('profiles', profileId, 'sessions.json');

const registerSessionHandlers = (): void => {
  handle('sessions:list', async (_event, profileId: string) => {
    const sessions = await readJson<PlaySession[]>(sessionsPath(profileId), []);
    return sessions.sort((a, b) => b.startedAt - a.startedAt);
  });

  handle('sessions:save', async (_event, profileId: string, session: PlaySession) => {
    const sessions = await readJson<PlaySession[]>(sessionsPath(profileId), []);
    sessions.push(session);
    await writeJson(sessionsPath(profileId), sessions.slice(-MAX_SESSIONS));
  });

  // Tracker state
  handle('tracker:save', (_event, profileId: string, state: unknown) =>
    writeJson(getUserDataPath('profiles', profileId, 'tracker.json'), state));

  handle('tracker:load', (_event, profileId: string) =>
    readJson<unknown>(getUserDataPath('profiles', profileId, 'tracker.json'), null));
};

export { registerSessionHandlers };
