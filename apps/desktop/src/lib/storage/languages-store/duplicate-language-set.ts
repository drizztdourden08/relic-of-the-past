/* @layer renderer-lib @kind logic */
import type { LanguageSet } from '@shared/game/language';
import * as languages from '@shared/storage/languages';
import { recompileAll } from '../assets-store';
import { platformFiles } from '../platform-files';

const duplicateLanguageSet = async (sourceId: string, id: string, name: string): Promise<LanguageSet> => {
  const created = await languages.duplicateSet(platformFiles(), sourceId, id, name);
  await recompileAll();
  return created;
};

export { duplicateLanguageSet };
