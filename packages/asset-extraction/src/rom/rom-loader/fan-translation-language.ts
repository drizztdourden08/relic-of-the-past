/* @layer shared-asset-extraction @kind logic */
import { FAN_TRANSLATION_SHA1 } from './rom-loader.constants';

const fanTranslationLanguage = (hash: string): string | null => FAN_TRANSLATION_SHA1[hash.toUpperCase()] ?? null;

export { fanTranslationLanguage };
