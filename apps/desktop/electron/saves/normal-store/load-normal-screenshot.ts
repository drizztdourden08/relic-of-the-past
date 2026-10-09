/* @layer electron-main @kind logic */
import { normalManifestStore } from './normal-manifest-store';

const loadNormalScreenshot = (profileId: string, id: string): Promise<Buffer | null> =>
  normalManifestStore.loadScreenshot(profileId, id);

export { loadNormalScreenshot };
