/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { QuickSaveSlotInfo } from '../../save-types';
import { quickDir } from '../../save-paths';
import { QUICK_SLOTS } from '../saves.constants';

const getSlotInfos = async (files: FileStore, p: string): Promise<QuickSaveSlotInfo[]> => {
  const out: QuickSaveSlotInfo[] = [];
  for (let slot = 0; slot < QUICK_SLOTS; slot += 1) {
    const stat = await files.stat(`${quickDir(p)}/save${slot}.sav`);
    if (!stat) continue;
    out.push({ slot, timestamp: stat.mtimeMs, size: stat.bytes, hasScreenshot: await files.exists(`${quickDir(p)}/save${slot}.png`) });
  }
  return out;
};

export { getSlotInfos };
