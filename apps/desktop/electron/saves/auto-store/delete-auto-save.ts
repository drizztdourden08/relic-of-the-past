/* @layer electron-main @kind logic */
import { autoManifestStore } from './auto-manifest-store';

const deleteAutoSave = (profileId: string, id: string): Promise<void> => autoManifestStore.remove(profileId, id);

export { deleteAutoSave };
