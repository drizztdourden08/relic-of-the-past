/* @layer shared-storage @kind logic */
/**
 * The pack's inventory: every file the folder holds, whether or not a layer names it. Packs
 * hold more than the wiring (alternates, an unwired bed, a cover), and an export that followed
 * references alone would leave it behind. So the inventory is written into the manifest on every
 * save, an archive carries exactly that list, and an import can say which files did not make it.
 *
 * The rule: every regular file in the folder except the manifest, sorted by name so two saves
 * of the same folder produce the same text.
 */
import type { FileStore } from '@shared/platform';
import { MSUL_MANIFEST_NAME } from '@shared/types/msu-manifest';
import { packDir } from './msu-paths';

/** True for a directory entry that belongs in the inventory. */
const isInventoryName = (name: string): boolean => name !== MSUL_MANIFEST_NAME;

/** The inventory in its written order, from whatever names a listing produced. */
const sortInventory = (names: string[]): string[] =>
  names.filter(isInventoryName).sort((a, b) => a.localeCompare(b));

const listPackEntries = async (files: FileStore, pack: string): Promise<string[]> => {
  const out: string[] = [];
  for (const name of await files.list(packDir(pack))) {
    if (!isInventoryName(name)) continue;
    const st = await files.stat(`${packDir(pack)}/${name}`);
    if (st && !st.isDirectory) out.push(name);
  }
  return sortInventory(out);
};

export { isInventoryName, listPackEntries, sortInventory };
