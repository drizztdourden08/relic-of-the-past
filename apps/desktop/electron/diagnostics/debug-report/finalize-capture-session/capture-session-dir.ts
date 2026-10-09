/* @layer electron-main @kind logic */
import { getUserDataPath } from '../../../lib/paths';
import { CAPTURES_SUBDIR } from './finalize-capture-session.constants';

const captureSessionDir = (profileId: string, sessionKey: string): string =>
  getUserDataPath('profiles', profileId, CAPTURES_SUBDIR, sessionKey);

export { captureSessionDir };
