/* @layer electron-main @kind logic */
import { join } from 'path';
import { getProfileSavesDir } from './store';
import { createManifestStore } from './manifest-store';
import type { AutoSaveInfo } from '@shared/types/saves';

const DEFAULT_MAX_ENTRIES = 5;
const ABSOLUTE_MAX_ENTRIES = 20;

const getAutoSavesDir = (profileId: string): string =>
  join(getProfileSavesDir(profileId), 'auto');

interface AutoSaveManifestEntry {
  id: string;
  timestamp: number;
  trigger: 'timer' | 'quit';
}

const store = createManifestStore<AutoSaveManifestEntry, AutoSaveInfo>({
  getDir: getAutoSavesDir,
  toInfo: (e, slot) => ({ id: e.id, timestamp: e.timestamp, size: slot.size, trigger: e.trigger, hasScreenshot: slot.hasScreenshot }),
});

const createAutoSave = async (profileId: string, trigger: 'timer' | 'quit', data: Buffer, screenshot?: Buffer): Promise<AutoSaveInfo> => {
  const timestamp = Date.now();
  const entry: AutoSaveManifestEntry = { id: String(timestamp), timestamp, trigger };
  await store.append(profileId, entry, data, screenshot);
  return { id: entry.id, timestamp, size: data.byteLength, trigger, hasScreenshot: !!screenshot };
};

const listAutoSaves = (profileId: string): Promise<AutoSaveInfo[]> => store.list(profileId);
const loadAutoSave = (profileId: string, id: string): Promise<Buffer | null> => store.load(profileId, id);
const loadAutoScreenshot = (profileId: string, id: string): Promise<Buffer | null> => store.loadScreenshot(profileId, id);
const deleteAutoSave = (profileId: string, id: string): Promise<void> => store.remove(profileId, id);

const pruneAutoSaves = async (profileId: string, maxEntries?: number): Promise<void> => {
  const max = Math.min(maxEntries ?? DEFAULT_MAX_ENTRIES, ABSOLUTE_MAX_ENTRIES);
  const manifest = await store.readManifest(profileId);
  if (manifest.length <= max) return;

  // Sort oldest first, remove excess
  const sorted = [...manifest].sort((a, b) => a.timestamp - b.timestamp);
  const toRemove = sorted.slice(0, sorted.length - max);

  for (const entry of toRemove) {
    await deleteAutoSave(profileId, entry.id);
  }
};

export {
  ABSOLUTE_MAX_ENTRIES,
  createAutoSave,
  DEFAULT_MAX_ENTRIES,
  deleteAutoSave,
  getAutoSavesDir,
  listAutoSaves,
  loadAutoSave,
  loadAutoScreenshot,
  pruneAutoSaves,
};
