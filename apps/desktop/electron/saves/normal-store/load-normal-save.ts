/* @layer electron-main @kind logic */
import { normalManifestStore } from './normal-manifest-store';

const loadNormalSave = (profileId: string, id: string): Promise<Buffer | null> => normalManifestStore.load(profileId, id);

export { loadNormalSave };
