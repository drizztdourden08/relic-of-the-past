/* @layer electron-main @kind logic */
/**
 * Input profile persistence — per-game-profile input bindings.
 */

import { join } from 'path';
import { readFile, mkdir, writeFile } from 'fs/promises';

let userDataPath = '';

const initProfileStore = (dataPath: string): void => {
  userDataPath = dataPath;
};

const path = (...segments: string[]): string => {
  return join(userDataPath, 'Data', ...segments);
};

const readInputProfiles = async (profileId: string): Promise<unknown[]> => {
  try {
    const data = await readFile(path('profiles', profileId, 'input-profiles.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeInputProfiles = async (profileId: string, profiles: unknown[]): Promise<void> => {
  const profileDir = path('profiles', profileId);
  await mkdir(profileDir, { recursive: true });
  await writeFile(join(profileDir, 'input-profiles.json'), JSON.stringify(profiles, null, 2), 'utf-8');
};

export { initProfileStore, readInputProfiles, writeInputProfiles };
