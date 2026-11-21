/* @layer renderer-stores @kind constants */
import type { LanguageGraphicsAvailability } from './language-graphics-store.type';

const NO_LANGUAGE_GRAPHICS: LanguageGraphicsAvailability = {
  pieces: { langMenuScreens: false, langPauseWords: false, langMapLabels: false, langEndingCredits: false },
  japanese: false,
};

export { NO_LANGUAGE_GRAPHICS };
