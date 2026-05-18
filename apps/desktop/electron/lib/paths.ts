import { join } from 'path';
import { mkdir } from 'fs/promises';

let userDataPath = '';

export function initPaths(dataPath: string): void {
  userDataPath = dataPath;
}

export function getUserDataPath(...segments: string[]): string {
  return join(userDataPath, 'Data', ...segments);
}

/** Legacy path (pre-migration, directly under userData/) */
export function getLegacyPath(...segments: string[]): string {
  return join(userDataPath, ...segments);
}

export async function ensureDataDirectories(): Promise<void> {
  const dirs = ['assets', 'roms', 'profiles', 'config', 'msu', 'languages', 'sprites'];
  for (const dir of dirs) {
    await mkdir(getUserDataPath(dir), { recursive: true });
  }
}
