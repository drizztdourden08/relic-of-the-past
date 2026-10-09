/* @layer electron-main @kind logic */
import { join } from 'path';
import { statSaveSlot } from '../save-slot';
import { getQuickSavesDir } from './get-quick-saves-dir';
import { QUICK_SAVE_SLOTS } from './store.constants';
import type { SaveSlotInfo } from './store.type';

const getQuickSlotInfos = async (profileId: string): Promise<SaveSlotInfo[]> => {
  const quickDir = getQuickSavesDir(profileId);
  const results: SaveSlotInfo[] = [];
  for (let slot = 0; slot < QUICK_SAVE_SLOTS; slot++) {
    const info = await statSaveSlot(join(quickDir, `save${slot}.sav`), join(quickDir, `save${slot}.png`));
    if (!info) continue;
    results.push({ slot, timestamp: info.mtimeMs, size: info.size, hasScreenshot: info.hasScreenshot });
  }
  return results;
};

export { getQuickSlotInfos };
