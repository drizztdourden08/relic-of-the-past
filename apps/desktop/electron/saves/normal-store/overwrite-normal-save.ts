/* @layer electron-main @kind logic */
import type { NormalSaveInfo } from '@shared/types/saves';
import { normalManifestStore } from './normal-manifest-store';

const overwriteNormalSave = async (profileId: string, id: string, data: Buffer, screenshot?: Buffer): Promise<NormalSaveInfo | null> => {
  const manifest = await normalManifestStore.readManifest(profileId);
  const entry = manifest.find((e) => e.id === id);
  if (!entry) return null;

  entry.timestamp = Date.now();
  await normalManifestStore.writePair(profileId, id, data, screenshot);
  await normalManifestStore.writeManifest(profileId, manifest);

  return { id, name: entry.name, timestamp: entry.timestamp, size: data.byteLength, hasScreenshot: !!screenshot };
};

export { overwriteNormalSave };
