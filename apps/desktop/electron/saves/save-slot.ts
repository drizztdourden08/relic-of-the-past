/* @layer electron-main @kind logic */
import { stat } from 'fs/promises';
import type { SaveSlotStat } from './save-slot.type';

const screenshotExists = async (pngPath: string): Promise<boolean> => {
  try {
    await stat(pngPath);
    return true;
  } catch {
    return false;
  }
};

const statSaveSlot = async (savPath: string, pngPath: string): Promise<SaveSlotStat | null> => {
  let size: number;
  let mtimeMs: number;
  try {
    const s = await stat(savPath);
    size = s.size;
    mtimeMs = s.mtimeMs;
  } catch {
    return null;
  }

  const hasScreenshot = await screenshotExists(pngPath);

  return { size, mtimeMs, hasScreenshot };
};

export { statSaveSlot };
export type { SaveSlotStat };
