/* @layer shared-game @kind logic */
import type { BorderEdge } from '@rotp/game-core';
import { ROOM_GRID } from './flood-fill.constants';

const getAdjacentRoom = (roomIdx: number, edge: BorderEdge): number | null => {
  const col = roomIdx % ROOM_GRID.cols;
  const row = Math.floor(roomIdx / ROOM_GRID.cols);
  switch (edge) {
    case 'north': return row > 0 ? roomIdx - ROOM_GRID.cols : null;
    case 'south': return row < ROOM_GRID.rows - 1 ? roomIdx + ROOM_GRID.cols : null;
    case 'west': return col > 0 ? roomIdx - 1 : null;
    case 'east': return col < ROOM_GRID.cols - 1 ? roomIdx + 1 : null;
  }
};

export { getAdjacentRoom };
