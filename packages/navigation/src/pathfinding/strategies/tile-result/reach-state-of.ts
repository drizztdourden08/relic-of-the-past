/* @layer shared-game @kind logic */
import type { ReachState, TilePassability } from '@rotp/game-core';
import { TRAVERSAL_DIR_OFFSET, STAIRS_TRAVERSAL_STATE } from '../../types/grid.constants';

const reachStateOf = (tile: TilePassability): ReachState => {
  if (tile.type === 'blocked') return 0;
  if (tile.type === 'ledge') return TRAVERSAL_DIR_OFFSET[tile.dir];
  if (tile.type === 'stairs') return STAIRS_TRAVERSAL_STATE;
  return 1;
};

export { reachStateOf };
