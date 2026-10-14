/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import type { DrawContext } from './draw.type';
import { drawDotDisc } from './draw-dot-disc';
import { hasRequirement } from './has-requirement';
import { isOffscreen } from './is-offscreen';

const drawHookTargets = (dc: DrawContext, drawResults: FloodFillResult[]): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, TILE_PX, getScreenWorldOrigin } = dc;
  ctx.globalAlpha = 0.7;
  for (const drawResult of drawResults) {
    if (!drawResult.hookTargets || drawResult.hookTargets.length === 0) continue;
    const origin = getScreenWorldOrigin(drawResult.screenIndex);
    for (const ht of drawResult.hookTargets) {
      const screenX = origin.x + ht.col * TILE_PX + TILE_PX / 2 - viewLeft;
      const screenY = origin.y + ht.row * TILE_PX + TILE_PX / 2 - viewTop;
      if (isOffscreen(dc, screenX, screenY)) continue;
      drawDotDisc(dc, screenX * scaleX, screenY * scaleY, hasRequirement(drawResult.reqGrid, ht.row, ht.col));
    }
  }
};

export { drawHookTargets };
