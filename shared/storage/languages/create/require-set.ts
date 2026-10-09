/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { LanguageSet } from '@shared/game/language';
import { getSet } from '../read';

const requireSet = async (files: FileStore, id: string): Promise<LanguageSet> => {
  const set = await getSet(files, id);
  if (!set) throw new Error(`Language set "${id}" was not found.`);
  return set;
};

export { requireSet };
