/* @layer electron-main @kind logic */
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { getQuickSavesDir } from './get-quick-saves-dir';

const writeQuickScreenshot = async (profileId: string, slot: number, pngData: Buffer): Promise<void> => {
  const quickDir = getQuickSavesDir(profileId);
  await mkdir(quickDir, { recursive: true });
  await writeFile(join(quickDir, `save${slot}.png`), pngData);
};

export { writeQuickScreenshot };
