/* @layer renderer-lib @kind logic */
import type { LanguageSummary } from '@rotp/asset-extraction';
import { languages } from '@rotp/languages';
import { platformFiles } from '../platform-files';

const listLanguages = (): Promise<LanguageSummary[]> => languages.listPacks(platformFiles());

export { listLanguages };
