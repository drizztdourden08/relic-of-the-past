/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import type { DrawContext } from './draw.type';
import { CLIFF_ARROW_COLOR } from './draw.constants';
import { drawCliffArrow } from './draw-cliff-arrow';

const drawCliffArrows = (dc: DrawContext, drawResults: FloodFillResult[]): void => {
  const { ctx, getScreenWorldOrigin } = dc;

  ctx.globalAlpha = 1.0;
  ctx.strokeStyle = CLIFF_ARROW_COLOR;
  ctx.fillStyle = CLIFF_ARROW_COLOR;
  for (const drawResult of drawResults) {
    const origin = getScreenWorldOrigin(drawResult.screenIndex);
    for (const ledge of drawResult.ledges) drawCliffArrow(dc, origin, ledge);
  }
};

export { drawCliffArrows };
