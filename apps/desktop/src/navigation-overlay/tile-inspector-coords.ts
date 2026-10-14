/* @layer renderer-components @kind logic */
import { GRID_SIZE } from '@rotp/navigation';
import { screenOriginFor } from '@app/game/flood';
import { viewOrigin } from '@rotp/game-core';
import type { GridPos } from './navigation-overlay.type';
import type { MouseEventToTileParams } from './tile-inspector-coords.type';
import { TILE_PX } from './pathfinding/pathfinding.constants';

const mouseEventToTile = (params: MouseEventToTileParams): GridPos | null => {
  const { event, vp, result, width, height, isIndoors } = params;
  if (!vp || !result.attrGrid) return null;
  const rect = event.currentTarget.getBoundingClientRect();
  const mx = event.clientX - rect.left;
  const my = event.clientY - rect.top;
  const scaleX = width / vp.snesWidth;
  const scaleY = height / vp.snesHeight;
  const snesX = mx / scaleX;
  const snesY = my / scaleY;
  const { viewLeft, viewTop } = viewOrigin(vp);
  const worldX = snesX + viewLeft;
  const worldY = snesY + viewTop;
  const { x: screenWorldX, y: screenWorldY } = screenOriginFor({
    isIndoors, linkX: vp.linkX, linkY: vp.linkY, screenIndex: result.screenIndex,
  });
  const col = Math.floor((worldX - screenWorldX) / TILE_PX);
  const row = Math.floor((worldY - screenWorldY) / TILE_PX);
  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return null;
  return { row, col };
};

export { mouseEventToTile };
