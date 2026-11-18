/* @layer shared-asset-extraction @kind logic */
import { fanTranslationLanguage } from './fan-translation-language';
import { FAN_TRANSLATION_NAMES } from './rom-loader.constants';

const fanTranslationRefusal = (hash: string): string | null => {
  const language = fanTranslationLanguage(hash);
  if (language === null) return null;
  return `This is ${FAN_TRANSLATION_NAMES[language]}, which is a language, not a game ROM. Import it as a language: Languages > New language > Fan-patched ROM.`;
};

export { fanTranslationRefusal };
