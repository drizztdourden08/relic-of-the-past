/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@shared/game/navigation';
import { GRID } from './place-tile.constants';

const inGrid = (tile: GridPos): boolean =>
  tile.row >= 0 && tile.row < GRID && tile.col >= 0 && tile.col < GRID;

export { inGrid };
