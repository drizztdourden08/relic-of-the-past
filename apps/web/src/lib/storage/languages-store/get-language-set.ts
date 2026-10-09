/* @layer renderer-lib @kind logic */
import type { LanguageSet } from '@shared/game/language';
import * as languages from '@shared/storage/languages';
import { platformFiles } from '../platform-files';

const getLanguageSet = (id: string): Promise<LanguageSet | null> => languages.getSet(platformFiles(), id);

export { getLanguageSet };
