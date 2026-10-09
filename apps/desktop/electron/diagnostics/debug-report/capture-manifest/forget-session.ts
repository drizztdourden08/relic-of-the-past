/* @layer electron-main @kind logic */
import { writeJsonFile } from '@drizztdourden08/brock-electron/main';
import { captureManifestPath } from './capture-manifest-path';
import { readCaptureManifest } from './read-capture-manifest';

const forgetSession = async (profileId: string, sessionKey: string): Promise<void> => {
  const manifest = await readCaptureManifest(profileId);
  if (!(sessionKey in manifest)) return;
  delete manifest[sessionKey];
  await writeJsonFile(captureManifestPath(profileId), manifest);
};

export { forgetSession };
