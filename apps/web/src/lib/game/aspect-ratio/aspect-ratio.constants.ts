/* @layer bridge-wasm @kind constants */
const BASE_WIDTH = 256;
const BASE_HEIGHT = 224;
const PPU_EXTRA_LEFT_RIGHT = 384;
const PPU_EXTRA_TOP_BOTTOM = 128;
const EXTEND_Y_HEIGHT = 240;

const MIN_ASPECT = BASE_WIDTH / (BASE_HEIGHT + 2 * PPU_EXTRA_TOP_BOTTOM);
const MAX_ASPECT = (BASE_WIDTH + 2 * PPU_EXTRA_LEFT_RIGHT) / EXTEND_Y_HEIGHT;

const RATIO_EPSILON = 1e-6;

const FALLBACK_WIDTH = 16;
const FALLBACK_HEIGHT = 9;

const COMMON_RATIOS: ReadonlyArray<readonly [number, number]> = [
  [1, 1], [5, 4], [4, 3], [3, 2], [16, 10], [5, 3], [16, 9], [17, 9], [18, 9], [19, 9], [32, 15], [20, 9], [21, 9],
];

export { MIN_ASPECT, MAX_ASPECT, RATIO_EPSILON, FALLBACK_WIDTH, FALLBACK_HEIGHT, COMMON_RATIOS };
