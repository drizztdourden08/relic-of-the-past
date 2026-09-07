/* @layer electron-main @kind logic */
/** Reads what a report actually ships for each capture session: the position timeline plus
 *  whatever finalize-capture-session.ts put in packaged/ (a size-budgeted video, or a PNG
 *  fallback) - never the unlimited local frames/full video, which stay on disk for review
 *  regardless of whether a report ever gets sent. A session with no packaged/ folder has
 *  already been swept into an earlier report and is skipped, not re-shipped. */
import { readdir, readFile, rm } from 'fs/promises';
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

const collectCaptureSessions = async (profileId: string): Promise<FinalizedCaptureSession[]> => {
  const root = getUserDataPath('profiles', profileId, CAPTURES_SUBDIR);
  let sessionKeys: string[];
  try {
    sessionKeys = (await readdir(root, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }

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

/** Called once a report finished zipping those sessions in, so the same recording never gets
 *  bundled into a second report. Only removes packaged/ - the unlimited local frames and full
 *  video are kept regardless, for local review. */
const deleteCaptureSessions = async (profileId: string, sessionKeys: string[]): Promise<void> => {
  const root = getUserDataPath('profiles', profileId, CAPTURES_SUBDIR);
  await Promise.all(sessionKeys.map((key) =>
    rm(join(root, key, PACKAGED_SUBDIR), { recursive: true, force: true }).catch(() => {})));
};

export { collectCaptureSessions, deleteCaptureSessions };
export type { FinalizedCaptureSession, CaptureSessionFile };
