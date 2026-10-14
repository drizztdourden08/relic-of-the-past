/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import { GRID_SIZE } from '@rotp/navigation';
import type { DrawContext } from './draw.type';
import { drawPitCell } from './draw-pit-cell';

const drawPitStripes = (dc: DrawContext, drawResults: FloodFillResult[]): void => {
  const { ctx, scaleX, scaleY, getScreenWorldOrigin } = dc;

  ctx.globalAlpha = 0.45;
  const stripeSize = Math.max(2, 3 * Math.min(scaleX, scaleY));
  for (const drawResult of drawResults) {
    if (!drawResult.attrGrid) continue;
    const origin = getScreenWorldOrigin(drawResult.screenIndex);
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) drawPitCell({ dc, drawResult, origin, r, c, stripeSize });
    }
  }
};

export { drawPitStripes };
