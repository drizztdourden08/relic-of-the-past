/* @layer renderer-lib @kind logic */
import type { LanguagePack } from '@rotp/asset-extraction';
import * as languages from '@shared/storage/languages';
import { platformFiles } from '../platform-files';

const getLanguage = (code: string): Promise<LanguagePack | null> => languages.getLanguage(platformFiles(), code);

export { getLanguage };
