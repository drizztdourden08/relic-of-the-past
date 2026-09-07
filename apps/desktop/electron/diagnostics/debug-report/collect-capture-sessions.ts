/* @layer electron-main @kind logic */
/** Reads what a report actually ships for each capture session the picker checked: the
 *  position timeline plus whatever finalize-capture-session.ts put in packaged/ (a
 *  size-budgeted video, or a PNG fallback) - never the unlimited local frames/full video,
 *  which stay on disk for review regardless of whether a report ever gets sent. Which
 *  sessions ship is the caller's explicit choice (`sessionKeys`, from the picker), not every
 *  session with a packaged/ folder: nothing here decides eligibility or mutates disk state -
 *  a session is marked sent only once the resulting report actually uploads, see
 *  capture-manifest.ts. */
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { getUserDataPath } from '../../lib/paths';
import { CAPTURES_SUBDIR, PACKAGED_SUBDIR } from './finalize-capture-session';

interface CaptureSessionFile {
  name: string;
  contents: Buffer;
}

interface FinalizedCaptureSession {
  sessionKey: string;
  files: CaptureSessionFile[];
}

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
export type { FinalizedCaptureSession, CaptureSessionFile };
