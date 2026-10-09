/* @layer renderer-components @kind logic */
import type React from 'react';
import { GRID_SIZE } from '@rotp/navigation';
import type { FloodFillResult } from '@rotp/game-core';
import type { wasmGetViewportInfo } from '../../../../game';
import type { GridPos } from './navigation-overlay.type';
import { screenOriginFor } from '@app/game/flood';
import { viewOrigin } from '@rotp/game-core';
import { TILE_PX } from './pathfinding/pathfinding.constants';

const mouseEventToTile = (
  e: React.MouseEvent<HTMLDivElement>,
  vp: ReturnType<typeof wasmGetViewportInfo>,
  result: FloodFillResult,
  width: number,
  height: number,
  isIndoors: boolean,
): GridPos | null => {
  if (!vp || !result.attrGrid) return null;
  const rect = e.currentTarget.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
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
