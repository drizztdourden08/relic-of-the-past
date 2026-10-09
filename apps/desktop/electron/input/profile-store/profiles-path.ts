/* @layer electron-main @kind logic */
import { getUserDataPath } from '../../lib/paths';

const profilesPath = (profileId: string): string =>
  getUserDataPath('profiles', profileId, 'input-profiles.json');

export { profilesPath };
