/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import { GRID_SIZE } from '@rotp/navigation';
import type { DrawContext } from './draw.type';
import type { PerLayerReach } from './dot-cell.type';
import { drawDotCell } from './draw-dot-cell';
import { drawFloodStart } from './draw-flood-start';
import { drawHookTargets } from './draw-hook-targets';

const drawReachableDots = (dc: DrawContext, drawResults: FloodFillResult[], perLayer: PerLayerReach | null): void => {
  dc.ctx.globalAlpha = 0.55;
  for (const drawResult of drawResults) {
    const origin = dc.getScreenWorldOrigin(drawResult.screenIndex);
    const singleLayerIsAbove = perLayer === null && drawResult.indoors && (drawResult.startLayer ?? 0) === 0;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        drawDotCell({ dc, drawResult, origin, perLayer, singleLayerIsAbove, row, col });
      }
    }
  }

  drawFloodStart(dc, drawResults[0]);
  drawHookTargets(dc, drawResults);
};

export { drawReachableDots };
