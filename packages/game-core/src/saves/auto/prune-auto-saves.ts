/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { AUTO_ABS_MAX, AUTO_DEFAULT_MAX } from '../saves.constants';
import { autoSaves } from './auto-saves';

const pruneAutoSaves = async (files: FileStore, p: string, maxEntries?: number): Promise<void> => {
  const s = autoSaves(files, p);
  const max = Math.min(maxEntries ?? AUTO_DEFAULT_MAX, AUTO_ABS_MAX);
  const manifest = await s.readManifest();
  if (manifest.length <= max) return;
  const sorted = [...manifest].sort((a, b) => a.timestamp - b.timestamp);
  for (const entry of sorted.slice(0, sorted.length - max)) await s.remove(entry.id);
};

export { pruneAutoSaves };
