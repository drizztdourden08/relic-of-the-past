/* @layer electron-main @kind logic */
import type { NormalSaveInfo } from '@shared/types/saves';
import { statSaveSlot } from '../save-slot';
import { getNormalSavesDir } from './get-normal-saves-dir';
import { normalManifestStore } from './normal-manifest-store';

const renameNormalSave = async (profileId: string, id: string, newName: string): Promise<NormalSaveInfo | null> => {
  const manifest = await normalManifestStore.readManifest(profileId);
  const entry = manifest.find((e) => e.id === id);
  if (!entry) return null;

  entry.name = newName;
  await normalManifestStore.writeManifest(profileId, manifest);

  const { sav, png } = normalManifestStore.savPaths(getNormalSavesDir(profileId), id);
  const slot = await statSaveSlot(sav, png);
  if (!slot) return null;
  return { id, name: newName, timestamp: entry.timestamp, size: slot.size, hasScreenshot: slot.hasScreenshot };
};

export { renameNormalSave };
