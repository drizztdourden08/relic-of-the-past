/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { GAME_ROM_LANGUAGE } from '@rotp/asset-extraction';
import { languageLabel } from './language-label';
import type { ProfileLanguage } from './profile-language.type';

type LanguageOption = { value: string; label: string; disabled?: string };

// A language whose glyphs need the Japanese sprites stays listed but locked, with the reason.
const languageOptions = (languages: ReadonlyArray<ProfileLanguage>, t: I18n['t']): LanguageOption[] => {
  const locked = new Set(languages.filter((language) => language.locked).map((language) => language.code));
  const others = languages.map((language) => language.code).filter((code) => code !== GAME_ROM_LANGUAGE);
  return [GAME_ROM_LANGUAGE, ...others].map((code) => ({
    value: code,
    label: languageLabel(code, t),
    ...(locked.has(code) ? { disabled: t('settings-controls:disabled.japanese-font') } : {}),
  }));
};

export { languageOptions };
