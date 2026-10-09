/* @layer shared-asset-extraction @kind constants */
import type { RGBA } from '../../graphics/palette';

const OAM_FLAGS_FALLBACK = 0xff;
const GEAR_PALETTE_ROW = 5;

const CRYSTAL_RECEIPT_ID = 32;
const CRYSTAL_PALETTE_ROW = 6;
const CRYSTAL_GRADIENT_FIRST_INDEX = 9;
const CRYSTAL_GRADIENT: readonly RGBA[] = [
  [255, 255, 255, 255],
  [90, 130, 220, 255],
  [50, 80, 180, 255],
  [140, 180, 255, 255],
  [20, 40, 100, 255],
  [70, 115, 200, 255],
  [40, 60, 150, 255],
];

const LARGE_RECEIPT = 2;

export {
  CRYSTAL_GRADIENT, CRYSTAL_GRADIENT_FIRST_INDEX, CRYSTAL_PALETTE_ROW, CRYSTAL_RECEIPT_ID,
  GEAR_PALETTE_ROW, LARGE_RECEIPT, OAM_FLAGS_FALLBACK,
};
