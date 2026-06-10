/* @layer electron-main @kind logic */
/** Stat a save's .sav file and probe for a sibling .png screenshot. */
import { stat } from 'fs/promises';

interface SaveSlotStat {
  size: number;
  mtimeMs: number;
  hasScreenshot: boolean;
}

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

  let hasScreenshot = false;
  try {
    await stat(pngPath);
    hasScreenshot = true;
  } catch { /* no screenshot */ }

  return { size, mtimeMs, hasScreenshot };
};

export { statSaveSlot };
export type { SaveSlotStat };
