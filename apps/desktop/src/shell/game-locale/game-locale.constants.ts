/* @layer renderer-app @kind constants */
const GAME_LOCALE_OF: Readonly<Record<string, string>> = {
  us: 'en',
  en: 'en',
  'en-redux': 'en',
  fr: 'fr',
  'fr-c': 'fr',
  'fr-ca': 'fr',
  de: 'de',
  ja: 'ja',
  es: 'es',
  it: 'it',
  pt: 'pt',
  'pt-br': 'pt',
  pl: 'pl',
  nl: 'nl',
  sv: 'sv',
};

const GAME_LOCALE_FALLBACK = 'en';

export { GAME_LOCALE_FALLBACK, GAME_LOCALE_OF };
