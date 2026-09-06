/* @layer shared-storage @kind logic */
/**
 * Per-profile JSON stores over FileStore: play sessions (capped + sorted),
 * tracker state, randomizer placement, and input-binding profiles. Same
 * paths/format as the Electron handlers
 * (profiles/<id>/{sessions,tracker,randomizer,input-profiles}.json).
 */
import type { FileStore } from '@shared/platform';
import type { PlaySession } from '@shared/types/session';
import { readJson, writeJson } from './json';

const MAX_SESSIONS = 100;

const sessionsPath = (p: string): string => `profiles/${p}/sessions.json`;
const trackerPath = (p: string): string => `profiles/${p}/tracker.json`;
const randomizerPath = (p: string): string => `profiles/${p}/randomizer.json`;
const inputProfilesPath = (p: string): string => `profiles/${p}/input-profiles.json`;

const listSessions = async (files: FileStore, p: string): Promise<PlaySession[]> =>
  (await readJson<PlaySession[]>(files, sessionsPath(p), [])).sort((a, b) => b.startedAt - a.startedAt);

const saveSession = async (files: FileStore, p: string, session: PlaySession): Promise<void> => {
  const sessions = await readJson<PlaySession[]>(files, sessionsPath(p), []);
  sessions.push(session);
  await writeJson(files, sessionsPath(p), sessions.slice(-MAX_SESSIONS));
};

const saveTracker = (files: FileStore, p: string, state: unknown): Promise<void> => writeJson(files, trackerPath(p), state);
const loadTracker = (files: FileStore, p: string): Promise<unknown> => readJson<unknown>(files, trackerPath(p), null);

const saveRandomizer = (files: FileStore, p: string, placement: unknown): Promise<void> => writeJson(files, randomizerPath(p), placement);
const loadRandomizer = (files: FileStore, p: string): Promise<unknown> => readJson<unknown>(files, randomizerPath(p), null);

const readInputProfiles = (files: FileStore, p: string): Promise<unknown[]> => readJson<unknown[]>(files, inputProfilesPath(p), []);
const writeInputProfiles = (files: FileStore, p: string, profiles: unknown[]): Promise<void> => writeJson(files, inputProfilesPath(p), profiles);

export { listSessions, saveSession, saveTracker, loadTracker, saveRandomizer, loadRandomizer, readInputProfiles, writeInputProfiles };
