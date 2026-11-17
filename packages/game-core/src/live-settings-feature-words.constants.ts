/* @layer bridge-wasm @kind constants */
const FEATURES2_FLAGS = {
  jaIntroGraphics: 1 << 20,
  jaHudGraphics: 1 << 21,
  jaCopyrightLine: 1 << 22,
  jaFileSelectStyle: 1 << 23,
  widescreenPlayArea: 1 << 24,
  widescreenIdleEnemies: 1 << 25,
  titleOverride: 1 << 26,
  hostMenu: 1 << 27,
  modernControls: 1 << 28,
  allowDiving: 1 << 29,
  extendedLetters: 1 << 30,
  languageScreens: 1 << 31,
} as const;

const BUG_FIX_WORD_FEATURES2 = 2;

const JA_GRAPHICS_KEYS = ['jaIntroGraphics', 'jaHudGraphics', 'jaCopyrightLine', 'jaFileSelectStyle'] as const;

export { BUG_FIX_WORD_FEATURES2, FEATURES2_FLAGS, JA_GRAPHICS_KEYS };
