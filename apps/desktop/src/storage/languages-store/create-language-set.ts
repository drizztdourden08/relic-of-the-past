/* @layer renderer-lib @kind logic */
import type { LanguageSet, CreateSetParams } from '@rotp/languages';
import { languages } from '@rotp/languages';
import { recompileAll } from '../assets-store';
import { platformFiles } from '../platform-files';

const createLanguageSet = async (params: CreateSetParams): Promise<LanguageSet> => {
  const created = await languages.createSet(platformFiles(), params);
  await recompileAll();
  return created;
};

export { createLanguageSet };
