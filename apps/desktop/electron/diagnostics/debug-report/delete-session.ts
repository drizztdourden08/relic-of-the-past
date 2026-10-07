/* @layer electron-main @kind logic */
/** Deletes one capture session outright: frames, both videos, snapshots.jsonl and packaged/ -
 *  everything under debug-captures/<profileId>/<sessionKey>/. Used by the picker's own delete
 *  action, confirmed in the renderer first; this performs the removal with no further checks. */
import { rm } from 'fs/promises';
import { getUserDataPath } from '../../lib/paths';
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
