/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@shared/game/navigation';
import { GRID } from './place-tile.constants';

const clampToGrid = (tile: GridPos): GridPos => ({
  row: Math.min(GRID - 1, Math.max(0, tile.row)),
  col: Math.min(GRID - 1, Math.max(0, tile.col)),
});

export { clampToGrid };
