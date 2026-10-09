/* @layer electron-main @kind logic */
import { autoManifestStore } from './auto-manifest-store';

const loadAutoScreenshot = (profileId: string, id: string): Promise<Buffer | null> =>
  autoManifestStore.loadScreenshot(profileId, id);

export { loadAutoScreenshot };
