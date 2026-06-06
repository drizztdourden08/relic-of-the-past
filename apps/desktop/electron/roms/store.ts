import { readFile, readdir, stat, mkdir } from 'fs/promises';
import { getUserDataPath } from '../lib/paths';

const listRoms = async (): Promise<string[]> => {
  const romsDir = getUserDataPath('roms');
  await mkdir(romsDir, { recursive: true });

  try {
    const files = await readdir(romsDir);
    return files.filter((f) => /\.(sfc|smc)$/i.test(f));
  } catch {
    return [];
  }
};

const hasAssetForRom = async (romFile: string): Promise<boolean> => {
  const assetFile = getAssetFileName(romFile);
  try {
    const s = await stat(getUserDataPath('assets', assetFile));
    return s.size > 0;
  } catch {
    return false;
  }
};

const getAssetFileName = (romFile: string): string => {
  return romFile.replace(/\.(sfc|smc)$/i, '.dat');
};

export { getAssetFileName, hasAssetForRom, listRoms };
