/* @layer renderer-components @kind logic */
/** Maps a mouse event to a 64×64 tile (row,col) within the active screen. */
import type React from 'react';
import type { FloodFillResult } from '@shared/game/navigation';
import type { wasmGetViewportInfo } from '../../../../../../../lib/game';
import type { GridPos } from './types';

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
  const snesW = vp.snesWidth;
  const snesH = vp.snesHeight;
  const scaleX = width / snesW;
  const scaleY = height / snesH;
  const snesX = mx / scaleX;
  const snesY = my / scaleY;
  const viewLeft = vp.cameraX - vp.extraLeftRight;
  const viewTop = vp.cameraY;
  const worldX = snesX + viewLeft;
  const worldY = snesY + viewTop;
  const screenWorldX = isIndoors
    ? (Math.floor(vp.linkX / 512) * 512)
    : ((result.screenIndex & 7) * 512);
  const screenWorldY = isIndoors
    ? (Math.floor(vp.linkY / 512) * 512)
    : (((result.screenIndex >> 3) & 7) * 512);
  const col = Math.floor((worldX - screenWorldX) / 8);
  const row = Math.floor((worldY - screenWorldY) / 8);
  if (row < 0 || row >= 64 || col < 0 || col >= 64) return null;
  return { row, col };
};

export { mouseEventToTile };
