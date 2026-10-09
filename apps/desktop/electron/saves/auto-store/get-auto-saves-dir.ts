/* @layer electron-main @kind logic */
import { join } from 'path';
import { getProfileSavesDir } from '../store';

const getAutoSavesDir = (profileId: string): string =>
  join(getProfileSavesDir(profileId), 'auto');

export { getAutoSavesDir };
