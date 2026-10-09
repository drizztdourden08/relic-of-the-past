/* @layer electron-main @kind logic */
import { join } from 'path';
import { readFile } from 'fs/promises';
import { getQuickSavesDir } from './get-quick-saves-dir';

const readQuickScreenshot = async (profileId: string, slot: number): Promise<Buffer | null> => {
  try {
    return await readFile(join(getQuickSavesDir(profileId), `save${slot}.png`));
  } catch {
    return null;
  }
};

export { readQuickScreenshot };
