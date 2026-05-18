import { readFile, readdir, stat, mkdir } from 'fs/promises';
import { getUserDataPath } from '../lib/paths';

export async function listRoms(): Promise<string[]> {
  const romsDir = getUserDataPath('roms');
  await mkdir(romsDir, { recursive: true });

  try {
    const files = await readdir(romsDir);
    return files.filter((f) => /\.(sfc|smc)$/i.test(f));
  } catch {
    return [];
  }
}

export async function hasAssetForRom(romFile: string): Promise<boolean> {
  const assetFile = getAssetFileName(romFile);
  try {
    const s = await stat(getUserDataPath('assets', assetFile));
    return s.size > 0;
  } catch {
    return false;
  }
}

export function getAssetFileName(romFile: string): string {
  return romFile.replace(/\.(sfc|smc)$/i, '.dat');
}
