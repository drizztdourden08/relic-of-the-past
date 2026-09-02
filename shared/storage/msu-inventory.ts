/* @layer shared-storage @kind logic */
/**
 * The pack's inventory: every file the folder holds, whether or not a layer names it.
 *
 * A manifest that listed only what its layers reference would describe the wiring and nothing
 * else. Packs hold more than that — alternates kept for later, a bed that is not wired yet, a
 * cover — and an export that follows the references alone leaves all of it behind. So the
 * inventory is written into the manifest on every save, and an archive carries exactly that list,
 * which is also what lets an import say precisely which files did not make it.
 *
 * The rule is small enough to state once: every regular file in the folder except the manifest
 * itself, sorted by name so two saves of the same folder produce the same text.
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
