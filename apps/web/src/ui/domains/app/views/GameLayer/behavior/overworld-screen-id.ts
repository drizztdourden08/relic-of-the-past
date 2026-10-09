/* @layer renderer-components @kind logic */
import type { ViewportInfo } from '../../../../../../lib/game';
import { OVERWORLD_GRID_SIDE, OVERWORLD_SCREEN_PX, VIEW_HALF_HEIGHT, VIEW_HALF_WIDTH } from './overworld-screen-id.constants';

const overworldScreenIdOf = (vp: ViewportInfo): number => {
  const screenCol = Math.floor((vp.cameraX + VIEW_HALF_WIDTH) / OVERWORLD_SCREEN_PX) & (OVERWORLD_GRID_SIDE - 1);
  const screenRow = Math.floor((vp.cameraY + VIEW_HALF_HEIGHT) / OVERWORLD_SCREEN_PX) & (OVERWORLD_GRID_SIDE - 1);
  return screenRow * OVERWORLD_GRID_SIDE + screenCol;
};

export { overworldScreenIdOf };
