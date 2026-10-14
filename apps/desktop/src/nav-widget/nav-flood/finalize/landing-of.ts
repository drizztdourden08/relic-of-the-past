/* @layer renderer-widgets @kind logic */
import { spawnLandingTile } from '../../../game/flood';
import { ROOM_GRID_TILES } from '../nav-flood.constants';
import type { FallHoleLanding } from '../nav-flood.type';
import type { Point } from './landing-of.type';

const isInGrid = (index: number): boolean => index >= 0 && index < ROOM_GRID_TILES;

const landingOf = (entranceId: number, spawn: Point | undefined, origin: Point): FallHoleLanding | undefined => {
  if (!spawn) return undefined;
  const { row: gridRow, col: gridCol } = spawnLandingTile(spawn.x, spawn.y, origin);
  return isInGrid(gridRow) && isInGrid(gridCol) ? { gridRow, gridCol, entranceId } : undefined;
};

export { landingOf };
