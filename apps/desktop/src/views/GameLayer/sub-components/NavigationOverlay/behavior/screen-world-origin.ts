/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import type { ViewportInfo } from '../../../../../game';
import { SCREEN_GRID_MASK, SCREEN_PX } from '../sub-components/TileInspector.constants';

const screenWorldOrigin = (vp: ViewportInfo, result: FloodFillResult, isIndoors: boolean): { x: number; y: number } => {
  if (isIndoors) {
    return { x: Math.floor(vp.linkX / SCREEN_PX) * SCREEN_PX, y: Math.floor(vp.linkY / SCREEN_PX) * SCREEN_PX };
  }
  return {
    x: (result.screenIndex & SCREEN_GRID_MASK) * SCREEN_PX,
    y: ((result.screenIndex >> 3) & SCREEN_GRID_MASK) * SCREEN_PX,
  };
};

export { screenWorldOrigin };
