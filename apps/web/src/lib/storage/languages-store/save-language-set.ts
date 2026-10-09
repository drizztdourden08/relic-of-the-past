/* @layer renderer-lib @kind logic */
import type { LanguageSet } from '@shared/game/language';
import * as languages from '@shared/storage/languages';
import { recompileAll } from '../assets-store';
import { platformFiles } from '../platform-files';

const saveLanguageSet = async (set: LanguageSet): Promise<void> => {
  await languages.saveSet(platformFiles(), set);
  await recompileAll();
};

export { saveLanguageSet };
