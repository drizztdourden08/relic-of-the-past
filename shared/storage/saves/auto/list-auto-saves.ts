/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { AutoSaveInfo } from '@shared/types/saves';
import { autoSaves } from './auto-saves';

const listAutoSaves = async (files: FileStore, p: string): Promise<AutoSaveInfo[]> =>
  (await autoSaves(files, p).valid()).map((v) => ({ id: v.entry.id, timestamp: v.entry.timestamp, size: v.bytes, trigger: v.entry.trigger, hasScreenshot: v.hasScreenshot }));

export { listAutoSaves };
