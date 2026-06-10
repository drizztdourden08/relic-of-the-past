/* @layer electron-main @kind logic */
/**
 * Input profile persistence — per-game-profile input bindings.
 */

import { getUserDataPath } from '../lib/paths';
import { readJson, writeJson } from '../lib/json-store';

const profilesPath = (profileId: string): string =>
  getUserDataPath('profiles', profileId, 'input-profiles.json');

const readInputProfiles = (profileId: string): Promise<unknown[]> =>
  readJson<unknown[]>(profilesPath(profileId), []);

const writeInputProfiles = (profileId: string, profiles: unknown[]): Promise<void> =>
  writeJson(profilesPath(profileId), profiles);

export { readInputProfiles, writeInputProfiles };
