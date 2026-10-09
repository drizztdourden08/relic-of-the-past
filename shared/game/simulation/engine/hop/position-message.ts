/* @layer shared-game @kind logic */
import type { GridPos } from '../../../navigation/types';

const positionMessage = (label: 'START' | 'END', tile: GridPos): string => `${label} at ${tile.col},${tile.row}`;

export { positionMessage };
