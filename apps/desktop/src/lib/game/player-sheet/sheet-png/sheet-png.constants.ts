/* @layer renderer-lib @kind constants */
import { SHEET_COLS, SHEET_BYTES } from '@shared/game/data/player-sheet/types';
import type { Wearing } from '@shared/game/data/player-sheet/types';
import { TILE } from '../draw-tiles';

const SHEET_ROWS = SHEET_BYTES / (SHEET_COLS * 32);
const SHEET_PNG_WIDTH = SHEET_COLS * TILE;
const SHEET_PNG_HEIGHT = SHEET_ROWS * TILE;
const DEFAULT_WEARING: Wearing = { outfit: 'green', gloves: 0 };

export { SHEET_ROWS, SHEET_PNG_WIDTH, SHEET_PNG_HEIGHT, DEFAULT_WEARING };
