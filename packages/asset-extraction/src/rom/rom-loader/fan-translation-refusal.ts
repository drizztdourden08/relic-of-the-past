/* @layer shared-asset-extraction @kind logic */
import { FAN_TRANSLATION_NAMES, FAN_TRANSLATION_SHA1 } from './rom-loader.constants';

const fanTranslationLanguage = (hash: string): string | null => FAN_TRANSLATION_SHA1[hash.toUpperCase()] ?? null;

const fanTranslationRefusal = (hash: string): string | null => {
  const language = fanTranslationLanguage(hash);
  if (language === null) return null;
  return `This is ${FAN_TRANSLATION_NAMES[language]}, which is a language, not a game ROM. Import it as a language: Languages > New language > Fan-patched ROM.`;
};

export { fanTranslationLanguage, fanTranslationRefusal };
