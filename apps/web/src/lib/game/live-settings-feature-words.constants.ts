/* @layer bridge-wasm @kind constants */
const FEATURES2_FLAGS = {
  widescreenPlayArea: 1 << 24,
  widescreenIdleEnemies: 1 << 25,
  titleOverride: 1 << 26,
  hostMenu: 1 << 27,
  modernControls: 1 << 28,
  allowDiving: 1 << 29,
} as const;

const BUG_FIX_WORD_FEATURES2 = 2;

export { BUG_FIX_WORD_FEATURES2, FEATURES2_FLAGS };
