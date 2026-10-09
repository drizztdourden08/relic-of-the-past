/* @layer electron-main @kind logic */
import { readdir, mkdir } from 'fs/promises';
import { getUserDataPath } from '../../lib/paths';

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

export { listRoms };
