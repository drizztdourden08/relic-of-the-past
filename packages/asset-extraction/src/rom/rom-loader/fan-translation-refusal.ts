/* @layer shared-asset-extraction @kind logic */
import { FAN_TRANSLATION_SHA1 } from './rom-loader.constants';

const fanTranslationRefusal = (hash: string): string | null => {
  const name = FAN_TRANSLATION_SHA1[hash.toUpperCase()];
  if (name === undefined) return null;
  return `This is ${name}, which is a language, not a game ROM. Import it as a language: Languages > New language > Fan-patched ROM.`;
};

export { fanTranslationRefusal };
