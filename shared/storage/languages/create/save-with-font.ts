/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { LanguageSet } from '@shared/game/language';
import { saveSet } from '../write';
import { copyFont } from './copy-font';

const saveWithFont = async (files: FileStore, set: LanguageSet, fromId: string): Promise<LanguageSet> => {
  await saveSet(files, set);
  await copyFont(files, fromId, set.id);
  return set;
};

export { saveWithFont };
