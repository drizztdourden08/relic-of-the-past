/* @layer electron-main @kind logic */
import { writeJson } from '../../../lib/json-store';
import { captureManifestPath } from './capture-manifest-path';
import { readCaptureManifest } from './read-capture-manifest';

const forgetSession = async (profileId: string, sessionKey: string): Promise<void> => {
  const manifest = await readCaptureManifest(profileId);
  if (!(sessionKey in manifest)) return;
  delete manifest[sessionKey];
  await writeJson(captureManifestPath(profileId), manifest);
};

export { forgetSession };
