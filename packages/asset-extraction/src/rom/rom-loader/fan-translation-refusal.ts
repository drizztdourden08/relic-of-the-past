/* @layer shared-asset-extraction @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { fanTranslationLanguage } from './fan-translation-language';
import { FAN_TRANSLATION_NAMES } from './rom-loader.constants';
import { RomLoadError } from './rom-load-error';

const fanTranslationRefusal = (hash: string): RomLoadError | null => {
  const language = fanTranslationLanguage(hash);
  if (language === null) return null;
  const name = FAN_TRANSLATION_NAMES[language] ?? language;
  return new RomLoadError(
    msg('rom-loader:error.fanTranslation', { name }),
    `This is ${name}, which is a language, not a game ROM. Import it as a language: Languages > New language > Fan-patched ROM.`,
  );
};

export { fanTranslationRefusal };
