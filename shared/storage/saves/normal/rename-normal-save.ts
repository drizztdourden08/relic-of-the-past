/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { NormalSaveInfo } from '@shared/types/saves';
import { normalSaves } from './normal-saves';

const renameNormalSave = async (files: FileStore, p: string, id: string, newName: string): Promise<NormalSaveInfo | null> => {
  const s = normalSaves(files, p);
  const manifest = await s.readManifest();
  const entry = manifest.find((e) => e.id === id);
  if (!entry) return null;
  entry.name = newName;
  await s.writeManifest(manifest);
  const stat = await files.stat(s.sav(id));
  if (!stat) return null;
  return { id, name: newName, timestamp: entry.timestamp, size: stat.bytes, hasScreenshot: await files.exists(s.png(id)) };
};

export { renameNormalSave };
