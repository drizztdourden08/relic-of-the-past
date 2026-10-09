/* @layer renderer-lib @kind logic */
import * as languages from '@shared/storage/languages';
import type { LanguageSetSummary } from '@shared/storage/languages';
import { platformFiles } from '../platform-files';

const listLanguageSets = (): Promise<LanguageSetSummary[]> => languages.list(platformFiles());

export { listLanguageSets };
