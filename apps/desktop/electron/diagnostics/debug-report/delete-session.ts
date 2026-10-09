/* @layer electron-main @kind logic */
import { rm } from 'fs/promises';
import { getUserDataPath } from '@drizztdourden08/brock-electron/main';
import { forgetSession } from './capture-manifest';
import { CAPTURES_SUBDIR } from './finalize-capture-session';
import type { DebugCaptureDeleteSessionResult } from '@shared/types/debug-report';

const deleteSession = async (profileId: string, sessionKey: string): Promise<DebugCaptureDeleteSessionResult> => {
  try {
    await rm(getUserDataPath('profiles', profileId, CAPTURES_SUBDIR, sessionKey), { recursive: true, force: true });
    await forgetSession(profileId, sessionKey);
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
};

export { deleteSession };
