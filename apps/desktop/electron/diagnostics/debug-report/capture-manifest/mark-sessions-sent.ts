/* @layer electron-main @kind logic */
import { writeJson } from '../../../lib/json-store';
import { captureManifestPath } from './capture-manifest-path';
import { readCaptureManifest } from './read-capture-manifest';

const markSessionsSent = async (profileId: string, sessionKeys: string[], sentAt: number): Promise<void> => {
  if (sessionKeys.length === 0) return;
  const manifest = await readCaptureManifest(profileId);
  for (const sessionKey of sessionKeys) manifest[sessionKey] = { sentAt };
  await writeJson(captureManifestPath(profileId), manifest);
};

export { markSessionsSent };
