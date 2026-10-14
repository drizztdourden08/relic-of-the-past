/* @layer renderer-widgets @kind logic */
import type { ScreenBundleGrid } from '@rotp/game-data';
import type { MinimapProps } from '../sub-components/IndoorMinimap.type';
import { indoorTilePoint } from './indoor-tile-point';

const playerPointOf = (bundle: ScreenBundleGrid, playerPos: MinimapProps['playerPos']): { x: number; y: number } | null => {
  if (!playerPos || !bundle.screens.includes(playerPos.screen)) return null;
  return indoorTilePoint(playerPos.col, playerPos.row);
};

export { playerPointOf };
