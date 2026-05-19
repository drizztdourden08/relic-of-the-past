import { join } from 'path';
import { mkdir } from 'fs/promises';

let userDataPath = '';

function initPaths(dataPath: string): void {
  userDataPath = dataPath;
}

function getUserDataPath(...segments: string[]): string {
  return join(userDataPath, 'Data', ...segments);
}

/** Legacy path (pre-migration, directly under userData/) */
function getLegacyPath(...segments: string[]): string {
  return join(userDataPath, ...segments);
}

async function ensureDataDirectories(): Promise<void> {
  const dirs = ['assets', 'roms', 'profiles', 'config', 'msu', 'languages', 'sprites'];
  for (const dir of dirs) {
    await mkdir(getUserDataPath(dir), { recursive: true });
  }
}

export {
  ensureDataDirectories,
  getLegacyPath,
  getUserDataPath,
  initPaths
};
