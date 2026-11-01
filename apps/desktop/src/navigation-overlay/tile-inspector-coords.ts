/* @layer renderer-components @kind logic */
import { GRID_SIZE } from '@rotp/navigation';
import { screenOriginFor } from '@app/game/flood';
import { pointerWorld } from './pointer-world';
import type { GridPos } from './navigation-overlay.type';
import type { MouseEventToTileParams } from './tile-inspector-coords.type';
import { TILE_PX } from './pathfinding/pathfinding.constants';

const mouseEventToTile = (params: MouseEventToTileParams): GridPos | null => {
  const { event, vp, result, width, height, isIndoors } = params;
  if (!vp || !result.attrGrid) return null;
  const { worldX, worldY } = pointerWorld({ event, vp, width, height });
  const { x: screenWorldX, y: screenWorldY } = screenOriginFor({
    isIndoors, linkX: vp.linkX, linkY: vp.linkY, screenIndex: result.screenIndex,
  });
  const col = Math.floor((worldX - screenWorldX) / TILE_PX);
  const row = Math.floor((worldY - screenWorldY) / TILE_PX);
  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return null;
  return { row, col };
};

export { mouseEventToTile };
