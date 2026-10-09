/* @layer electron-main @kind logic */
import { writeJson } from '../../lib/json-store';
import { profilesPath } from './profiles-path';

const writeInputProfiles = (profileId: string, profiles: unknown[]): Promise<void> =>
  writeJson(profilesPath(profileId), profiles);

export { writeInputProfiles };
