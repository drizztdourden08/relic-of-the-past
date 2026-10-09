/* @layer renderer-lib @kind logic */
import type { LanguageSet } from '@rotp/languages';
import { languages } from '@rotp/languages';
import { platformFiles } from '../platform-files';

const getLanguageSet = (id: string): Promise<LanguageSet | null> => languages.getSet(platformFiles(), id);

export { getLanguageSet };
