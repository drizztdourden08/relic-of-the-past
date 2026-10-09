/* @layer electron-main @kind logic */
import { normalManifestStore } from './normal-manifest-store';

const deleteNormalSave = (profileId: string, id: string): Promise<void> => normalManifestStore.remove(profileId, id);

export { deleteNormalSave };
