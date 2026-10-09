/* @layer electron-main @kind logic */
import { getUserDataPath } from '@drizztdourden08/brock-electron/main';

const profilesPath = (profileId: string): string =>
  getUserDataPath('profiles', profileId, 'input-profiles.json');

export { profilesPath };
