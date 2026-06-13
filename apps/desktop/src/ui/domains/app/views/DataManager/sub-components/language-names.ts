/* @layer renderer-components @kind logic */
/** Display names for supported dialogue language codes. */
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  de: 'German (Deutsch)',
  fr: 'French (Français)',
  'fr-c': 'French Canadian',
  es: 'Spanish (Español)',
  pl: 'Polish (Polski)',
  pt: 'Portuguese (Português)',
  nl: 'Dutch (Nederlands)',
  sv: 'Swedish (Svenska)',
  redux: 'Redux',
};

const languageLabel = (code: string): string => LANGUAGE_NAMES[code] ?? code;

export { LANGUAGE_NAMES, languageLabel };
