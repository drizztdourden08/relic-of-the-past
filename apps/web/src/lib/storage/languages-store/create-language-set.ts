/* @layer renderer-lib @kind logic */
import type { LanguageSet } from '@shared/game/language';
import * as languages from '@shared/storage/languages';
import type { CreateSetParams } from '@shared/storage/languages';
import { recompileAll } from '../assets-store';
import { platformFiles } from '../platform-files';

const createLanguageSet = async (params: CreateSetParams): Promise<LanguageSet> => {
  const created = await languages.createSet(platformFiles(), params);
  await recompileAll();
  return created;
};

export { createLanguageSet };
