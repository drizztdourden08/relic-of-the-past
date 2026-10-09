/* @layer electron-main @kind logic */
import { readJsonFile } from '@drizztdourden08/brock-electron/main';
import { captureManifestPath } from './capture-manifest-path';
import type { DebugCaptureManifest } from './capture-manifest.type';

const readCaptureManifest = (profileId: string): Promise<DebugCaptureManifest> =>
  readJsonFile<DebugCaptureManifest>(captureManifestPath(profileId), {});

export { readCaptureManifest };
