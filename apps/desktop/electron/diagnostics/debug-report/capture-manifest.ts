/* @layer electron-main @kind logic */
/** Tracks which capture sessions have actually been uploaded in a report, per profile, at
 *  debug-captures/<profileId>/manifest.json. Nothing else marks a session "sent": build no
 *  longer deletes anything (see collect-capture-sessions.ts), so a cancelled dialog or a
 *  failed upload leaves every session exactly as selectable as before. */
import { join } from 'path';
import { getUserDataPath } from '../../lib/paths';
import { readJson, writeJson } from '../../lib/json-store';
import { CAPTURES_SUBDIR } from './finalize-capture-session';

type DebugCaptureManifest = Record<string, { sentAt: number | null }>;

const manifestPath = (profileId: string): string =>
  join(getUserDataPath('profiles', profileId, CAPTURES_SUBDIR), 'manifest.json');

const readCaptureManifest = (profileId: string): Promise<DebugCaptureManifest> =>
  readJson<DebugCaptureManifest>(manifestPath(profileId), {});

const markSessionsSent = async (profileId: string, sessionKeys: string[], sentAt: number): Promise<void> => {
  if (sessionKeys.length === 0) return;
  const manifest = await readCaptureManifest(profileId);
  for (const sessionKey of sessionKeys) manifest[sessionKey] = { sentAt };
  await writeJson(manifestPath(profileId), manifest);
};

/** Called when a session is deleted outright, so its manifest entry doesn't linger forever. */
const forgetSession = async (profileId: string, sessionKey: string): Promise<void> => {
  const manifest = await readCaptureManifest(profileId);
  if (!(sessionKey in manifest)) return;
  delete manifest[sessionKey];
  await writeJson(manifestPath(profileId), manifest);
};

export { readCaptureManifest, markSessionsSent, forgetSession };
export type { DebugCaptureManifest };
