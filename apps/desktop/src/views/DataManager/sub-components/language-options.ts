/* @layer renderer-components @kind logic */
import { GAME_ROM_LANGUAGE } from '@rotp/asset-extraction';
import { languageLabel } from './language-label';

const languageOptions = (languages: ReadonlyArray<{ code: string }>): { value: string; label: string }[] => {
  const others = languages.map((language) => language.code).filter((code) => code !== GAME_ROM_LANGUAGE);
  return [GAME_ROM_LANGUAGE, ...others].map((code) => ({ value: code, label: languageLabel(code) }));
};

export { languageOptions };
