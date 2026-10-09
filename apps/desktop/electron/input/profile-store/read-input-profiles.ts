/* @layer electron-main @kind logic */
import { readJson } from '../../lib/json-store';
import { profilesPath } from './profiles-path';

const readInputProfiles = (profileId: string): Promise<unknown[]> =>
  readJson<unknown[]>(profilesPath(profileId), []);

export { readInputProfiles };
