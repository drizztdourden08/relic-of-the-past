/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import { GRID_SIZE } from '@rotp/navigation';
import type { DrawContext } from './draw.type';
import { drawStairRun } from './draw-stair-run';

const drawStairArrows = (dc: DrawContext, drawResults: FloodFillResult[]): void => {
  const { ctx, getScreenWorldOrigin } = dc;

  ctx.globalAlpha = 0.8;
  for (const drawResult of drawResults) {
    if (!drawResult.attrGrid) continue;
    const origin = getScreenWorldOrigin(drawResult.screenIndex);
    const visited = new Set<string>();
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) drawStairRun({ dc, drawResult, origin, visited, r, c });
    }
  }
};

export { drawStairArrows };
