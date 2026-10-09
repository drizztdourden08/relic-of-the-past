/* @layer renderer-lib @kind logic */
import type { LanguagePack } from '@shared/types/language';
import * as languages from '@shared/storage/languages';
import { platformFiles } from '../platform-files';

const getLanguage = (code: string): Promise<LanguagePack | null> => languages.getLanguage(platformFiles(), code);

export { getLanguage };
