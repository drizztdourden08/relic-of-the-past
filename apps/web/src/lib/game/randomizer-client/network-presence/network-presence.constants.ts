/* @layer bridge-wasm @kind constants */
const NON_GAME_TAGS: readonly string[] = ['Tracker', 'TextOnly', 'HintGame'];
const NON_GAME_PART = / has stopped \w+ the game\b/;

export { NON_GAME_PART, NON_GAME_TAGS };
