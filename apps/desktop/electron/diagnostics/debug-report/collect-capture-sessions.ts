/* @layer electron-main @kind logic */
/** Reads every already-finalized capture session (see finalize-capture-session.ts) straight
 *  off disk for a profile - each one's raw frames, position timeline, and video (when ffmpeg
 *  made one) already sit in their own folder, written the moment the recording stopped. */
import { readdir, readFile, rm } from 'fs/promises';
import { join } from 'path';
import { getUserDataPath } from '../../lib/paths';
import { CAPTURES_SUBDIR } from './finalize-capture-session';

interface CaptureSessionFile {
  name: string;
  contents: Buffer;
}

interface FinalizedCaptureSession {
  sessionKey: string;
  files: CaptureSessionFile[];
}

const collectCaptureSessions = async (profileId: string): Promise<FinalizedCaptureSession[]> => {
  const root = getUserDataPath('profiles', profileId, CAPTURES_SUBDIR);
  let entries: string[];
  try {
    entries = (await readdir(root, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }

  const sessions: FinalizedCaptureSession[] = [];
  for (const sessionKey of entries) {
    const dir = join(root, sessionKey);
    const fileNames = await readdir(dir);
    const files = await Promise.all(fileNames.map(async (name) => ({ name, contents: await readFile(join(dir, name)) })));
    sessions.push({ sessionKey, files });
  }
  return sessions;
};

/** Called once a report finished zipping those sessions in, so the same recording never gets
 *  bundled into a second report. */
const deleteCaptureSessions = async (profileId: string, sessionKeys: string[]): Promise<void> => {
  const root = getUserDataPath('profiles', profileId, CAPTURES_SUBDIR);
  await Promise.all(sessionKeys.map((key) => rm(join(root, key), { recursive: true, force: true }).catch(() => {})));
};

export { collectCaptureSessions, deleteCaptureSessions };
export type { FinalizedCaptureSession, CaptureSessionFile };
