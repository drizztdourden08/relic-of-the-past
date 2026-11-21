/* @layer bridge-wasm @kind constants */
const FEATURES2_FLAGS = {
  jaTitleScreen: 1 << 19,
  jaFileSelectStyle: 1 << 23,
  widescreenPlayArea: 1 << 24,
  widescreenIdleEnemies: 1 << 25,
  titleOverride: 1 << 26,
  hostMenu: 1 << 27,
  modernControls: 1 << 28,
  allowDiving: 1 << 29,
  extendedLetters: 1 << 30,
  languageScreens: 1 << 31,
  langMenuScreens: 1 << 14,
  langPauseWords: 1 << 15,
  langMapLabels: 1 << 17,
  langEndingCredits: 1 << 18,
} as const;

const BUG_FIX_WORD_FEATURES2 = 2;

const JA_GRAPHICS_KEYS = ['jaTitleScreen', 'jaFileSelectStyle'] as const;

const LANG_GRAPHICS_KEYS = ['langMenuScreens', 'langPauseWords', 'langMapLabels', 'langEndingCredits'] as const;

export { BUG_FIX_WORD_FEATURES2, FEATURES2_FLAGS, JA_GRAPHICS_KEYS, LANG_GRAPHICS_KEYS };
