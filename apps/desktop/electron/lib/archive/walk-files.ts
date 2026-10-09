/* @layer electron-main @kind logic */
import { join, extname } from 'path';
import { readdir } from 'fs/promises';

const walkFiles = async (dir: string, extensions?: Set<string>): Promise<string[]> => {
  const found: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...await walkFiles(full, extensions));
    } else if (!extensions || extensions.has(extname(entry.name).toLowerCase())) {
      found.push(full);
    }
  }
  return found;
};

export { walkFiles };
