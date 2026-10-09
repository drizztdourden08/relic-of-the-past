/* @layer electron-main @kind logic */
import { readJson } from '../../../lib/json-store';
import { captureManifestPath } from './capture-manifest-path';
import type { DebugCaptureManifest } from './capture-manifest.type';

const readCaptureManifest = (profileId: string): Promise<DebugCaptureManifest> =>
  readJson<DebugCaptureManifest>(captureManifestPath(profileId), {});

export { readCaptureManifest };
