/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { packDir } from '../msu-paths';
import { isInventoryName } from './is-inventory-name';
import { sortInventory } from './sort-inventory';

const listPackEntries = async (files: FileStore, pack: string): Promise<string[]> => {
  const out: string[] = [];
  for (const name of await files.list(packDir(pack))) {
    if (!isInventoryName(name)) continue;
    const st = await files.stat(`${packDir(pack)}/${name}`);
    if (st && !st.isDirectory) out.push(name);
  }
  return sortInventory(out);
};

export { listPackEntries };
