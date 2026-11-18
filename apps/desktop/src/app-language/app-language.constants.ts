/* @layer renderer-lib @kind constants */
import type { AppLanguageChoice } from './app-language.type';

const APP_LANGUAGES: readonly AppLanguageChoice[] = [
  { tag: 'en', name: 'English' },
  { tag: 'fr', name: 'Français' },
  { tag: 'de', name: 'Deutsch' },
  { tag: 'it', name: 'Italiano' },
  { tag: 'es', name: 'Español' },
  { tag: 'pt', name: 'Português' },
  { tag: 'pl', name: 'Polski' },
  { tag: 'nl', name: 'Nederlands' },
  { tag: 'sv', name: 'Svenska' },
  { tag: 'ja', name: '日本語' },
];

const DEFAULT_APP_LANGUAGE = 'en';
const APP_LANGUAGE_FILE = 'app-language.json';

export { APP_LANGUAGE_FILE, APP_LANGUAGES, DEFAULT_APP_LANGUAGE };
