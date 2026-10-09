/* @layer electron-main @kind logic */
import { join } from 'path';
import { readdir, stat } from 'fs/promises';
import { isInventoryName, sortInventory } from '@shared/storage/msu-inventory';
import { packPath } from './pack-path';

const packInventory = async (pack: string): Promise<string[]> => {
  const dir = packPath(pack);
  const out: string[] = [];
  for (const name of await readdir(dir).catch(() => [] as string[])) {
    if (!isInventoryName(name)) continue;
    try {
      if ((await stat(join(dir, name))).isFile()) out.push(name);
    } catch {
      continue;
    }
  }
  return sortInventory(out);
};

export { packInventory };
