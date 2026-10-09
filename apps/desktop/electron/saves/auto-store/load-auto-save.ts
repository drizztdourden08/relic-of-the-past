/* @layer electron-main @kind logic */
import { autoManifestStore } from './auto-manifest-store';

const loadAutoSave = (profileId: string, id: string): Promise<Buffer | null> => autoManifestStore.load(profileId, id);

export { loadAutoSave };
