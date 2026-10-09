/* @layer shared-asset-extraction @kind constants */
import type { RGBA } from '../graphics/palette';

const PALETTE_COLORS = 15;
const MAJOR_GREY_SHARE = 1 / 8;
const LIGHTNESS_WEIGHT = 0.5;
const MEDOID_ROUNDS = 32;
const BLACK: RGBA = [0, 0, 0, 255];
const WHITE: RGBA = [255, 255, 255, 255];

export { BLACK, LIGHTNESS_WEIGHT, MAJOR_GREY_SHARE, MEDOID_ROUNDS, PALETTE_COLORS, WHITE };
