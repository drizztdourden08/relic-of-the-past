/* @layer tests @kind helper */
import type { GridPos } from '@rotp/game-core';
import type { ScreenGridBundle } from '../../../shared/game/simulation/types';
import { GRID_SIZE } from './enemy-reach.constants';

const grids = {
  emptyReached: (): boolean[][] => Array.from({ length: GRID_SIZE }, () => new Array<boolean>(GRID_SIZE).fill(false)),
  fullyReached: (): boolean[][] => Array.from({ length: GRID_SIZE }, () => new Array<boolean>(GRID_SIZE).fill(true)),
  openAttr: (): number[][] => Array.from({ length: GRID_SIZE }, () => new Array<number>(GRID_SIZE).fill(0)),
  stamp2x2: (reached: boolean[][], at: GridPos): void => {
    reached[at.row][at.col] = true;
    reached[at.row][at.col + 1] = true;
    reached[at.row + 1][at.col] = true;
    reached[at.row + 1][at.col + 1] = true;
  },
  bundle: (rawAttrGrid: number[][]): ScreenGridBundle => ({ screenIndex: 1, indoors: false, rawAttrGrid }),
};

export { grids };
