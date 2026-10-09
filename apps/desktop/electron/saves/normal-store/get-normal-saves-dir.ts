/* @layer electron-main @kind logic */
import { join } from 'path';
import { getProfileSavesDir } from '../store';

const getNormalSavesDir = (profileId: string): string =>
  join(getProfileSavesDir(profileId), 'normal');

export { getNormalSavesDir };
