/* @layer electron-main @kind logic */
import type { AutoSaveInfo } from '@shared/types/saves';
import { autoManifestStore } from './auto-manifest-store';
import type { AutoSaveManifestEntry } from './auto-store.type';

const createAutoSave = async (profileId: string, trigger: 'timer' | 'quit', data: Buffer, screenshot?: Buffer): Promise<AutoSaveInfo> => {
  const timestamp = Date.now();
  const entry: AutoSaveManifestEntry = { id: String(timestamp), timestamp, trigger };
  await autoManifestStore.append(profileId, entry, data, screenshot);
  return { id: entry.id, timestamp, size: data.byteLength, trigger, hasScreenshot: !!screenshot };
};

export { createAutoSave };
