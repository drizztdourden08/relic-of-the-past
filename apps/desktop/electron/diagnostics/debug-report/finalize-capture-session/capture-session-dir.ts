/* @layer electron-main @kind logic */
import { getUserDataPath } from '@drizztdourden08/brock-electron/main';
import { CAPTURES_SUBDIR } from './finalize-capture-session.constants';

const captureSessionDir = (profileId: string, sessionKey: string): string =>
  getUserDataPath('profiles', profileId, CAPTURES_SUBDIR, sessionKey);

export { captureSessionDir };
