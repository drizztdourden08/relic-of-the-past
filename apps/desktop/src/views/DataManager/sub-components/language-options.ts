/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { GAME_ROM_LANGUAGE } from '@rotp/asset-extraction';
import { languageLabel } from './language-label';

const languageOptions = (languages: ReadonlyArray<{ code: string }>, t: I18n['t']): { value: string; label: string }[] => {
  const others = languages.map((language) => language.code).filter((code) => code !== GAME_ROM_LANGUAGE);
  return [GAME_ROM_LANGUAGE, ...others].map((code) => ({ value: code, label: languageLabel(code, t) }));
};

export { languageOptions };
