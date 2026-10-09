/* @layer electron-main @kind logic */
import { join } from 'path';
import { getProfileSavesDir } from './get-profile-saves-dir';

const getQuickSavesDir = (profileId: string): string => {
  return join(getProfileSavesDir(profileId), 'quick');
};

export { getQuickSavesDir };
