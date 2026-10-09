/* @layer electron-main @kind logic */
import type { NormalSaveInfo } from '@shared/types/saves';
import { createManifestStore } from '../manifest-store';
import { getNormalSavesDir } from './get-normal-saves-dir';
import type { NormalSaveManifestEntry } from './normal-store.type';

const normalManifestStore = createManifestStore<NormalSaveManifestEntry, NormalSaveInfo>({
  getDir: getNormalSavesDir,
  toInfo: (e, slot) => ({ id: e.id, name: e.name, timestamp: e.timestamp, size: slot.size, hasScreenshot: slot.hasScreenshot }),
});

export { normalManifestStore };
