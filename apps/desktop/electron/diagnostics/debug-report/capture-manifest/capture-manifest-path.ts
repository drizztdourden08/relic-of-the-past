/* @layer electron-main @kind logic */
import { join } from 'path';
import { getUserDataPath } from '../../../lib/paths';
import { CAPTURES_SUBDIR } from '../finalize-capture-session';

const captureManifestPath = (profileId: string): string =>
  join(getUserDataPath('profiles', profileId, CAPTURES_SUBDIR), 'manifest.json');

export { captureManifestPath };
