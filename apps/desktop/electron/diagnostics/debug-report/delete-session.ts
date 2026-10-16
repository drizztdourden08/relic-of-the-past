/* @layer electron-main @kind logic */
import { rm } from 'fs/promises';
import { getUserDataPath } from '@drizztdourden08/brock-electron/main';
import type { DebugCaptureDeleteSessionResult } from '@app/debug-report';
import { forgetSession } from './capture-manifest';
import { BAD_SESSION_ERROR } from './delete-session.constants';
import { CAPTURES_SUBDIR } from './finalize-capture-session';
import { isSessionKey } from './session-key';

const deleteSession = async (profileId: string, sessionKey: string): Promise<DebugCaptureDeleteSessionResult> => {
  if (!isSessionKey(sessionKey)) return { error: BAD_SESSION_ERROR };
  try {
    await rm(getUserDataPath('profiles', profileId, CAPTURES_SUBDIR, sessionKey), { recursive: true, force: true });
    await forgetSession(profileId, sessionKey);
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
};

export { deleteSession };
