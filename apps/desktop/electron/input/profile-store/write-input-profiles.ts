/* @layer electron-main @kind logic */
import { writeJsonFile } from '@drizztdourden08/brock-electron/main';
import { profilesPath } from './profiles-path';

const writeInputProfiles = (profileId: string, profiles: unknown[]): Promise<void> =>
  writeJsonFile(profilesPath(profileId), profiles);

export { writeInputProfiles };
