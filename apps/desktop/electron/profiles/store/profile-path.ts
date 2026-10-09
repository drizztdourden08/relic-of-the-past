/* @layer electron-main @kind logic */
import { getUserDataPath } from '../../lib/paths';

const profilePath = (id: string): string => getUserDataPath('profiles', id, 'profile.json');

export { profilePath };
