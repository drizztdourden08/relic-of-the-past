/* @layer electron-main @kind logic */
import { readdir } from 'fs/promises';
import { join } from 'path';

const collectFiles = async (path: string): Promise<string[]> => {
  if (path.endsWith('.ts')) return [path];
  const entries = await readdir(path, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? collectFiles(child) : Promise.resolve(entry.name.endsWith('.ts') ? [child] : []);
  }));
  return nested.flat();
};

export { collectFiles };
