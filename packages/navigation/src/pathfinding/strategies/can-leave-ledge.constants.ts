/* @layer shared-game @kind constants */
const LEDGE_EXIT_STEPS: ReadonlyMap<string, readonly [number | null, number | null]> = new Map<string, readonly [number | null, number | null]>([
  ['s', [1, null]],
  ['n', [-1, null]],
  ['e', [null, 1]],
  ['w', [null, -1]],
  ['ne', [-1, 1]],
  ['nw', [-1, -1]],
  ['se', [1, 1]],
  ['sw', [1, -1]],
]);

export { LEDGE_EXIT_STEPS };
