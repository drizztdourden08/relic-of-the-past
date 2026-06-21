/* @layer electron-main @kind logic */
import { join } from 'path';
import { mkdir } from 'fs/promises';

let userDataPath = '';

const initPaths = (dataPath: string): void => {
  userDataPath = dataPath;
};

const getUserDataPath = (...segments: string[]): string => {
  return join(userDataPath, 'Data', ...segments);
};

const getLegacyPath = (...segments: string[]): string => {
  return join(userDataPath, ...segments);
};

const ensureDataDirectories = async (): Promise<void> => {
  const dirs = ['assets', 'roms', 'profiles', 'config', 'msu', 'languages', 'sprites', 'link-sprites'];
  for (const dir of dirs) {
    await mkdir(getUserDataPath(dir), { recursive: true });
  }
};

export {
  ensureDataDirectories,
  getLegacyPath,
  getUserDataPath,
  initPaths
};
