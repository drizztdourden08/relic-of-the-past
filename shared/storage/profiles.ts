/* @layer shared-storage @kind logic */
/**
 * Profile / app-state / per-profile-config store expressed purely over the
 * FileStore port, so it runs identically on every platform. The on-disk layout
 * (app.json at the root, profiles/<id>/{profile.json,config.json,saves/}) and the
 * 2-space JSON format match the original Electron stores, so existing desktop data
 * is read unchanged.
 */
import type { FileStore } from '@shared/platform';
import type { Profile, ProfilePatch, AppState, CreateProfileOptions } from '@shared/types/profile';

const APP_STATE = 'app.json';
const profileFile = (id: string): string => `profiles/${id}/profile.json`;
const configFile = (id: string): string => `profiles/${id}/config.json`;

const readJson = async <T>(files: FileStore, path: string, fallback: T): Promise<T> => {
  const text = await files.readText(path);
  if (text == null) return fallback;
  try { return JSON.parse(text) as T; } catch { return fallback; }
};

const writeJson = (files: FileStore, path: string, data: unknown): Promise<void> =>
  files.writeText(path, JSON.stringify(data, null, 2));

const newId = (): string => {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return uuid.slice(0, 8);
  const bytes = globalThis.crypto?.getRandomValues?.(new Uint8Array(4));
  return bytes ? Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('') : Date.now().toString(16).slice(-8);
};

const getAppState = (files: FileStore): Promise<AppState> =>
  readJson<AppState>(files, APP_STATE, { lastProfileId: null });

const saveAppState = (files: FileStore, state: AppState): Promise<void> =>
  writeJson(files, APP_STATE, state);

const listProfiles = async (files: FileStore): Promise<Profile[]> => {
  const ids = await files.list('profiles');
  const profiles: Profile[] = [];
  for (const id of ids) {
    const profile = await readJson<Profile | null>(files, profileFile(id), null);
    if (profile) profiles.push(profile);
  }
  return profiles.sort((a, b) => b.lastPlayed - a.lastPlayed);
};

const loadProfile = (files: FileStore, id: string): Promise<Profile | null> =>
  readJson<Profile | null>(files, profileFile(id), null);

const createProfile = async (files: FileStore, opts: CreateProfileOptions): Promise<Profile> => {
  const { name, romFile, language, msuPack, randomizer } = opts;
  const id = newId();
  const now = Date.now();
  const profile: Profile = { id, name, romFile, created: now, lastPlayed: now };
  if (language) profile.language = language;
  if (msuPack) profile.msuPack = msuPack;
  if (randomizer) profile.randomizer = randomizer;
  await files.mkdir(`profiles/${id}/saves`);
  await writeJson(files, profileFile(id), profile);
  await writeJson(files, configFile(id), {});
  return profile;
};

// Whitelist by design: `randomizer` is deliberately not patchable. It is frozen at creation.
const updateProfile = async (files: FileStore, id: string, patch: ProfilePatch): Promise<Profile | null> => {
  const profile = await loadProfile(files, id);
  if (!profile) return null;
  if (patch.name != null) profile.name = patch.name;
  if (patch.language !== undefined) profile.language = patch.language ?? undefined;
  if (patch.msuPack !== undefined) profile.msuPack = patch.msuPack ?? undefined;
  await writeJson(files, profileFile(id), profile);
  return profile;
};

const deleteProfile = async (files: FileStore, id: string): Promise<void> => {
  await files.remove(`profiles/${id}`);
  const state = await getAppState(files);
  if (state.lastProfileId === id) {
    state.lastProfileId = null;
    await saveAppState(files, state);
  }
};

const setLastProfile = async (files: FileStore, id: string): Promise<void> => {
  const state = await getAppState(files);
  state.lastProfileId = id;
  await saveAppState(files, state);
};

const updateLastPlayed = async (files: FileStore, id: string): Promise<void> => {
  const profile = await loadProfile(files, id);
  if (profile) {
    profile.lastPlayed = Date.now();
    await writeJson(files, profileFile(id), profile);
  }
};

const readConfig = (files: FileStore, id: string): Promise<Record<string, unknown> | null> =>
  readJson<Record<string, unknown> | null>(files, configFile(id), null);

const writeConfig = (files: FileStore, id: string, settings: Record<string, unknown>): Promise<void> =>
  writeJson(files, configFile(id), settings);

export {
  getAppState, listProfiles, loadProfile, createProfile, updateProfile,
  deleteProfile, setLastProfile, updateLastPlayed, readConfig, writeConfig,
};
