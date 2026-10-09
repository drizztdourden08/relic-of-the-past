/* @layer shared-game @kind constants */
import type { OutfitId } from './player-sheet.type';

const SHEET_BYTES = 0x7000;
const SHEET_COLS = 16;
const COLORS_PER_OUTFIT = 15;
const OUTFIT_IDS: readonly OutfitId[] = ['green', 'blue', 'red', 'bunny'];
const GLOVES_INDEX = 13;

export { SHEET_BYTES, SHEET_COLS, COLORS_PER_OUTFIT, OUTFIT_IDS, GLOVES_INDEX };
