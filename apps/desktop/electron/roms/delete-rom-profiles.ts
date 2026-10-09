/* @layer electron-main @kind logic */
import { readdir, rm } from 'fs/promises';
import { getUserDataPath, readJsonFile, writeJsonFile } from '@drizztdourden08/brock-electron/main';
import { APP_STATE_FILE, DEFAULT_APP_STATE } from '@drizztdourden08/brock-core/storage';
import type { AppState, Profile } from '@drizztdourden08/brock-core/storage';

const deleteRomProfiles = async (romFile: string): Promise<void> => {
  const ids = await readdir(getUserDataPath('profiles')).catch(() => []);
  const remaining: string[] = [];
  for (const id of ids) {
    const profile = await readJsonFile<Profile | null>(getUserDataPath('profiles', id, 'profile.json'), null);
    if (!profile) continue;
    if (profile.romFile === romFile) await rm(getUserDataPath('profiles', profile.id), { recursive: true, force: true });
    else remaining.push(profile.id);
  }
  const appStatePath = getUserDataPath(APP_STATE_FILE);
  const appState = await readJsonFile<AppState>(appStatePath, DEFAULT_APP_STATE);
  if (appState.lastProfileId && !remaining.includes(appState.lastProfileId)) {
    await writeJsonFile(appStatePath, { ...appState, lastProfileId: null });
  }
};

export { deleteRomProfiles };
