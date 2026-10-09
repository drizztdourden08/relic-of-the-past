/* @layer electron-main @kind logic */
import { randomUUID } from 'crypto';
import type { NormalSaveInfo } from '@shared/types/saves';
import { normalManifestStore } from './normal-manifest-store';
import type { NormalSaveManifestEntry } from './normal-store.type';

const createNormalSave = async (profileId: string, name: string, data: Buffer, screenshot?: Buffer): Promise<NormalSaveInfo> => {
  const entry: NormalSaveManifestEntry = { id: randomUUID().slice(0, 8), name, timestamp: Date.now() };
  await normalManifestStore.append(profileId, entry, data, screenshot);
  return { id: entry.id, name, timestamp: entry.timestamp, size: data.byteLength, hasScreenshot: !!screenshot };
};

export { createNormalSave };
