/* @layer electron-main @kind logic */
import { ABSOLUTE_MAX_ENTRIES, DEFAULT_MAX_ENTRIES } from './auto-store.constants';
import { autoManifestStore } from './auto-manifest-store';
import { deleteAutoSave } from './delete-auto-save';

const pruneAutoSaves = async (profileId: string, maxEntries?: number): Promise<void> => {
  const max = Math.min(maxEntries ?? DEFAULT_MAX_ENTRIES, ABSOLUTE_MAX_ENTRIES);
  const manifest = await autoManifestStore.readManifest(profileId);
  if (manifest.length <= max) return;

  const oldestFirst = [...manifest].sort((a, b) => a.timestamp - b.timestamp);
  const toRemove = oldestFirst.slice(0, oldestFirst.length - max);

  for (const entry of toRemove) {
    await deleteAutoSave(profileId, entry.id);
  }
};

export { pruneAutoSaves };
