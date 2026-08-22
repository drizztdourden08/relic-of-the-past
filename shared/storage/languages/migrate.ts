/* @layer shared-storage @kind logic */
/**
 * Upgrade-on-read: a folder holding only the legacy extraction payload
 * (`dialogue.txt`, no `set.json`) is converted to a set the first time it is
 * listed or opened, and the new files are written alongside the old ones —
 * nothing is deleted, so a rollback keeps working and the asset recompile
 * still finds what it reads.
 *
 * Idempotent by construction: the presence of `set.json` ends it, so a second
 * pass is a single `exists` check and never overwrites edited content.
 */
import type { FileStore } from '@shared/platform';
import { setFromPack } from '@shared/game/language';
import { legacyDialoguePath, setMetaPath } from './paths';
import { readPack } from './pack';
import { saveSet } from './write';

/** Returns true when the folder holds a set after the call (migrated or already one). */
const migrateLegacySet = async (files: FileStore, id: string): Promise<boolean> => {
  if (await files.exists(setMetaPath(id))) return true;
  if (!await files.exists(legacyDialoguePath(id))) return false;
  const pack = await readPack(files, id);
  if (!pack) return false;
  await saveSet(files, setFromPack(pack));
  return true;
};

export { migrateLegacySet };
