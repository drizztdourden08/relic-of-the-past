/* @layer bridge-wasm @kind logic */
import { DOOR_LANDING_OFFSET } from './room-entrances.constants';
import type { ExitDoor } from './room-entrances.type';

const offsetFor = (direction: string): { row: number; col: number } => {
  switch (direction) {
    case 'south': return DOOR_LANDING_OFFSET.south;
    case 'north': return DOOR_LANDING_OFFSET.north;
    default: return DOOR_LANDING_OFFSET.side;
  }
};

const doorLandingTile = (door: ExitDoor): { row: number; col: number } => {
  const offset = offsetFor(door.direction);
  return { row: door.row + offset.row, col: door.col + offset.col };
};

export { doorLandingTile };
