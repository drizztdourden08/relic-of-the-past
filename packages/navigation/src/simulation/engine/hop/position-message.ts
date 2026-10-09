/* @layer shared-game @kind logic */
import type { GridPos } from '@rotp/game-core';

const positionMessage = (label: 'START' | 'END', tile: GridPos): string => `${label} at ${tile.col},${tile.row}`;

export { positionMessage };
