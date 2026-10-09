/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import { GRID_SIZE, STAIRS_TRAVERSAL_STATE } from '@rotp/navigation';
import type { DrawContext } from './draw.type';
import { ARROW_HEAD_SPREAD, STAIR_ARROW_COLOR } from './draw.constants';

const drawDoubleArrow = (dc: DrawContext, x1: number, y1: number, x2: number, y2: number): void => {
  const { ctx, scaleX, scaleY, TILE_PX } = dc;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const lineLen = Math.hypot(x2 - x1, y2 - y1);
  const headLen = Math.min(TILE_PX * Math.min(scaleX, scaleY) * 0.5, lineLen * 0.25);
  const spread = ARROW_HEAD_SPREAD;
  const shaftWidth = Math.max(1.5, 2 * Math.min(scaleX, scaleY));

  ctx.strokeStyle = STAIR_ARROW_COLOR;
  ctx.fillStyle = STAIR_ARROW_COLOR;
  ctx.globalAlpha = 1.0;
  ctx.lineWidth = shaftWidth;
  const dx = Math.cos(angle) * headLen * 0.85;
  const dy = Math.sin(angle) * headLen * 0.85;
  ctx.beginPath();
  ctx.moveTo(x1 + dx, y1 + dy);
  ctx.lineTo(x2 - dx, y2 - dy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - spread), y2 - headLen * Math.sin(angle - spread));
  ctx.lineTo(x2 - headLen * Math.cos(angle + spread), y2 - headLen * Math.sin(angle + spread));
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - headLen * Math.cos(angle - spread + Math.PI), y1 - headLen * Math.sin(angle - spread + Math.PI));
  ctx.lineTo(x1 - headLen * Math.cos(angle + spread + Math.PI), y1 - headLen * Math.sin(angle + spread + Math.PI));
  ctx.closePath();
  ctx.fill();
};

const drawStairArrows = (dc: DrawContext, drawResults: FloodFillResult[]): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, snesH, TILE_PX, getScreenWorldOrigin } = dc;

  ctx.globalAlpha = 0.8;
  for (const drawResult of drawResults) {
    if (!drawResult.attrGrid) continue;
    const origin = getScreenWorldOrigin(drawResult.screenIndex);
    const visited = new Set<string>();
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (drawResult.reachable[r][c] !== STAIRS_TRAVERSAL_STATE) continue;
        if (visited.has(`${r},${c}`)) continue;
        const minR = r;
        let maxR = r;
        visited.add(`${r},${c}`);
        let nr = r + 1;
        while (nr < GRID_SIZE && drawResult.reachable[nr][c] === STAIRS_TRAVERSAL_STATE) {
          visited.add(`${nr},${c}`);
          maxR = nr;
          nr++;
        }
        if (maxR - minR < 1) continue;

        const columnCenterX = origin.x + c * TILE_PX + TILE_PX / 2 - viewLeft;
        const startSY = origin.y + minR * TILE_PX - viewTop;
        const endSY = origin.y + (maxR + 1) * TILE_PX - viewTop;

        if (startSY > snesH + TILE_PX && endSY > snesH + TILE_PX) continue;
        if (startSY < -TILE_PX && endSY < -TILE_PX) continue;

        drawDoubleArrow(dc, columnCenterX * scaleX, startSY * scaleY, columnCenterX * scaleX, endSY * scaleY);
      }
    }
  }
};

export { drawStairArrows };
