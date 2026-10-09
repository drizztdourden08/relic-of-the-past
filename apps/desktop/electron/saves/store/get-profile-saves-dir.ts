/* @layer electron-main @kind logic */
import { getUserDataPath } from '../../lib/paths';

const getProfileSavesDir = (profileId: string): string => {
  return getUserDataPath('profiles', profileId, 'saves');
};

export { getProfileSavesDir };
