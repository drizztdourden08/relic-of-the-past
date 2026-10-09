/* @layer electron-main @kind logic */
import { readdir } from 'fs/promises';
import { getQuickSavesDir } from './get-quick-saves-dir';

const listQuickStates = async (profileId: string): Promise<number[]> => {
  const quickDir = getQuickSavesDir(profileId);
  try {
    const files = await readdir(quickDir);
    return files
      .filter((f) => /^save\d+\.sav$/.test(f))
      .map((f) => parseInt(f.match(/^save(\d+)\.sav$/)![1], 10))
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
};

export { listQuickStates };
