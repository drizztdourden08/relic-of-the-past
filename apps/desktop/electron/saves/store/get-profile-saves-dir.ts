/* @layer electron-main @kind logic */
import { getUserDataPath } from '@drizztdourden08/brock-electron/main';

const getProfileSavesDir = (profileId: string): string => {
  return getUserDataPath('profiles', profileId, 'saves');
};

export { getProfileSavesDir };
