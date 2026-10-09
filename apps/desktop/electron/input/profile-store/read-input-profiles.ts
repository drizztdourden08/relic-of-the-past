/* @layer electron-main @kind logic */
import { readJsonFile } from '@drizztdourden08/brock-electron/main';
import { profilesPath } from './profiles-path';

const readInputProfiles = (profileId: string): Promise<unknown[]> =>
  readJsonFile<unknown[]>(profilesPath(profileId), []);

export { readInputProfiles };
