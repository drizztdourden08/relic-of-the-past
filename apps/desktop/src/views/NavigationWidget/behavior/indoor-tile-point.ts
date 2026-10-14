/* @layer renderer-widgets @kind logic */
import { MAP_LEFT, MAP_SIZE, MAP_TOP, TILE_COUNT } from '../sub-components/IndoorMinimap.constants';

const indoorTilePoint = (col: number, row: number): { x: number; y: number } => ({
  x: MAP_LEFT + ((col + 0.5) / TILE_COUNT) * MAP_SIZE,
  y: MAP_TOP + ((row + 0.5) / TILE_COUNT) * MAP_SIZE,
});

export { indoorTilePoint };
