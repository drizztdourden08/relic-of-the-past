/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { setFromPack } from '../messages';
import { legacyDialoguePath, setMetaPath } from './paths';
import { readPack } from './pack';
import { saveSet } from './write';

const migrateLegacySet = async (files: FileStore, id: string): Promise<boolean> => {
  if (await files.exists(setMetaPath(id))) return true;
  if (!await files.exists(legacyDialoguePath(id))) return false;
  const pack = await readPack(files, id);
  if (!pack) return false;
  await saveSet(files, setFromPack(pack));
  return true;
};

export { migrateLegacySet };
