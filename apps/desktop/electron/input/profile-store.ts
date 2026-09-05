/* @layer electron-main @kind logic */
/**
 * Stores input bindings per game profile.
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
