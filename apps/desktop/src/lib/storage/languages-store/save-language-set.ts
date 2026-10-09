/* @layer renderer-lib @kind logic */
import type { LanguageSet } from '@rotp/languages';
import { languages } from '@rotp/languages';
import { recompileAll } from '../assets-store';
import { platformFiles } from '../platform-files';

const saveLanguageSet = async (set: LanguageSet): Promise<void> => {
  await languages.saveSet(platformFiles(), set);
  await recompileAll();
};

export { saveLanguageSet };
