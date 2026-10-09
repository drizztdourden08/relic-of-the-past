/* @layer renderer-lib @kind logic */
import type { LanguageSummary } from '@shared/types/language';
import * as languages from '@shared/storage/languages';
import { platformFiles } from '../platform-files';

const listLanguages = (): Promise<LanguageSummary[]> => languages.listPacks(platformFiles());

export { listLanguages };
