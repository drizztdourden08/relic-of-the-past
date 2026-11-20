/* @layer shared-asset-extraction @kind logic */
import { JAPANESE_LANGUAGE_CONFIG } from '../../../japanese/text/japanese-language-config.constants';
import { kLanguages } from './language-data.constants';
import type { LanguageConfig } from './language-data.type';

const languageConfigOf = (base: string): LanguageConfig | null =>
  kLanguages[base] ?? (base === JAPANESE_LANGUAGE_CONFIG.id ? JAPANESE_LANGUAGE_CONFIG : null);

export { languageConfigOf };
