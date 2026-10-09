/* @layer renderer-lib @kind constants */
import type { Wearing } from '@shared/game/data/player-sheet/types';

const STANDING_COLS = 2;
const STANDING_ROWS = 3;
const DEFAULT_WEARING: Wearing = { outfit: 'green', gloves: 0 };

export { STANDING_COLS, STANDING_ROWS, DEFAULT_WEARING };
