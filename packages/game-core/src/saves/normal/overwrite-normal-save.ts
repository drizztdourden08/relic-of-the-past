/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { NormalSaveInfo } from '../../save-types';
import { normalSaves } from './normal-saves';

const overwriteNormalSave = async (files: FileStore, p: string, id: string, data: Uint8Array, screenshot?: Uint8Array): Promise<NormalSaveInfo | null> => {
  const s = normalSaves(files, p);
  const manifest = await s.readManifest();
  const entry = manifest.find((e) => e.id === id);
  if (!entry) return null;
  entry.timestamp = Date.now();
  await s.writePair(id, data, screenshot);
  await s.writeManifest(manifest);
  return { id, name: entry.name, timestamp: entry.timestamp, size: data.byteLength, hasScreenshot: !!screenshot };
};

export { overwriteNormalSave };
