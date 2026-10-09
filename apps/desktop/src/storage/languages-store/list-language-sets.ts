/* @layer renderer-lib @kind logic */
import { languages } from '@rotp/languages';
import type { LanguageSetSummary } from '@rotp/languages';
import { platformFiles } from '../platform-files';

const listLanguageSets = (): Promise<LanguageSetSummary[]> => languages.list(platformFiles());

export { listLanguageSets };
