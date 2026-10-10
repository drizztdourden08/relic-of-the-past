/* @layer tests @kind helper */
import type { GridPos } from '@rotp/game-core';
import type { ScreenGridBundle } from '@rotp/navigation';
import { GRID_SIZE } from './enemy-reach.constants';
import { required } from '../../required';

const grids = {
  emptyReached: (): boolean[][] => Array.from({ length: GRID_SIZE }, () => new Array<boolean>(GRID_SIZE).fill(false)),
  fullyReached: (): boolean[][] => Array.from({ length: GRID_SIZE }, () => new Array<boolean>(GRID_SIZE).fill(true)),
  openAttr: (): number[][] => Array.from({ length: GRID_SIZE }, () => new Array<number>(GRID_SIZE).fill(0)),
  stamp2x2: (reached: boolean[][], at: GridPos): void => {
    const top = required(reached[at.row], 'stamp top row');
    const bottom = required(reached[at.row + 1], 'stamp bottom row');
    top[at.col] = true;
    top[at.col + 1] = true;
    bottom[at.col] = true;
    bottom[at.col + 1] = true;
  },
  bundle: (rawAttrGrid: number[][]): ScreenGridBundle => ({ screenIndex: 1, indoors: false, rawAttrGrid }),
};

export { grids };
