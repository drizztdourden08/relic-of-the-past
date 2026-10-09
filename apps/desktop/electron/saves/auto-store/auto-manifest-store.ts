/* @layer electron-main @kind logic */
import type { AutoSaveInfo } from '@shared/types/saves';
import { createManifestStore } from '../manifest-store';
import type { AutoSaveManifestEntry } from './auto-store.type';
import { getAutoSavesDir } from './get-auto-saves-dir';

const autoManifestStore = createManifestStore<AutoSaveManifestEntry, AutoSaveInfo>({
  getDir: getAutoSavesDir,
  toInfo: (e, slot) => ({ id: e.id, timestamp: e.timestamp, size: slot.size, trigger: e.trigger, hasScreenshot: slot.hasScreenshot }),
});

export { autoManifestStore };
