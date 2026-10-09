/* @layer renderer-app @kind logic */
import type { NumberBounds } from '@ds/composites/RecordEditor';
import { OVERWORLD_GRID, ROOM_GRID, SCREEN_FLOOR, SCREEN_TILE } from '../../DataInspector.constants';
import { isOverworld } from './is-overworld';

const screenBounds = (path: string, record: unknown): NumberBounds | undefined => {
  const grid = isOverworld(record) ? OVERWORLD_GRID : ROOM_GRID;
  if (path === 'position.gridX') return grid.x;
  if (path === 'position.gridY') return grid.y;
  if (path === 'position.floor') return SCREEN_FLOOR;
  if (path === 'spawns[].tile.x' || path === 'spawns[].tile.y') return SCREEN_TILE;
  return undefined;
};

export { screenBounds };
