/* @layer renderer-lib @kind logic */
import { languages } from '@rotp/languages';
import { recompileAll } from '../assets-store';
import { platformFiles } from '../platform-files';

const deleteLanguage = async (code: string): Promise<void> => {
  await languages.remove(platformFiles(), code);
  await recompileAll();
};

export { deleteLanguage };
