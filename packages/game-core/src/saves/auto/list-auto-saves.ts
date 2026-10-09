/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { AutoSaveInfo } from '../../save-types';
import { autoSaves } from './auto-saves';

const listAutoSaves = async (files: FileStore, p: string): Promise<AutoSaveInfo[]> =>
  (await autoSaves(files, p).valid()).map((v) => ({ id: v.entry.id, timestamp: v.entry.timestamp, size: v.bytes, trigger: v.entry.trigger, hasScreenshot: v.hasScreenshot }));

export { listAutoSaves };
