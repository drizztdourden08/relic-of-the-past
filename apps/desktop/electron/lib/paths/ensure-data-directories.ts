/* @layer electron-main @kind logic */
import { mkdir } from 'fs/promises';
import { getUserDataPath } from './get-user-data-path';

const ensureDataDirectories = async (): Promise<void> => {
  const dirs = ['assets', 'roms', 'profiles', 'config', 'msu', 'languages', 'sprites', 'link-sprites'];
  for (const dir of dirs) {
    await mkdir(getUserDataPath(dir), { recursive: true });
  }
};

export { ensureDataDirectories };
