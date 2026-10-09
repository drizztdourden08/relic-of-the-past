/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { AutoSaveInfo } from '@shared/types/saves';
import type { AutoEntry, AutoTrigger } from '../saves.type';
import { autoSaves } from './auto-saves';

const createAutoSave = async (files: FileStore, p: string, trigger: AutoTrigger, data: Uint8Array, screenshot?: Uint8Array): Promise<AutoSaveInfo> => {
  const timestamp = Date.now();
  const entry: AutoEntry = { id: String(timestamp), timestamp, trigger };
  await autoSaves(files, p).append(entry, data, screenshot);
  return { id: entry.id, timestamp, size: data.byteLength, trigger, hasScreenshot: !!screenshot };
};

export { createAutoSave };
