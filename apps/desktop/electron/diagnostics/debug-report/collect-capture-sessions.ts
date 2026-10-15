/* @layer electron-main @kind logic */
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { getUserDataPath } from '@drizztdourden08/brock-electron/main';
import { CAPTURES_SUBDIR, PACKAGED_SUBDIR } from './finalize-capture-session';
import type { CaptureSessionFile, FinalizedCaptureSession } from './collect-capture-sessions.type';

const collectCaptureSessions = async (profileId: string, sessionKeys: string[]): Promise<FinalizedCaptureSession[]> => {
  const root = getUserDataPath('profiles', profileId, CAPTURES_SUBDIR);
  const sessions: FinalizedCaptureSession[] = [];
  for (const sessionKey of sessionKeys) {
    const dir = join(root, sessionKey);
    const packagedDir = join(dir, PACKAGED_SUBDIR);
    const packagedNames = await readdir(packagedDir).catch(() => null);
    if (!packagedNames || packagedNames.length === 0) continue;

    const files: CaptureSessionFile[] = [];
    const snapshotsContents = await readFile(join(dir, 'snapshots.jsonl')).catch(() => null);
    if (snapshotsContents) files.push({ name: 'snapshots.jsonl', contents: snapshotsContents });
    for (const name of packagedNames) {
      files.push({ name, contents: await readFile(join(packagedDir, name)) });
    }
    sessions.push({ sessionKey, files });
  }
  return sessions;
};

export { collectCaptureSessions };
