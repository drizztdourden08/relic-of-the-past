/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@shared/game/navigation';
import { STAIRS_TRAVERSAL_STATE } from '@shared/game/navigation/types';
import type { DrawContext } from './draw-context';

const drawCliffArrows = (dc: DrawContext, drawResults: FloodFillResult[]): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, snesW, snesH, TILE_PX, getScreenWorldOrigin } = dc;

  ctx.globalAlpha = 1.0;
  ctx.strokeStyle = '#cc5555';
  ctx.fillStyle = '#cc5555';
  for (const drawResult of drawResults) {
    const origin = getScreenWorldOrigin(drawResult.screenIndex);
    for (const ledge of drawResult.ledges ?? []) {
      const startWorldX = origin.x + ledge.startCol * TILE_PX + TILE_PX / 2;
      const startWorldY = origin.y + ledge.startRow * TILE_PX + TILE_PX / 2;
      const endWorldX = origin.x + ledge.endCol * TILE_PX + TILE_PX / 2;
      const endWorldY = origin.y + ledge.endRow * TILE_PX + TILE_PX / 2;

      if (endWorldX === startWorldX && endWorldY === startWorldY) continue;

      // Both ends sit on a tile CENTRE. The tail used to be pulled half a tile
      // back along the direction, which put it inside the neighbouring tile and
      // made a jump look like it began one tile further back than it does — and on
      // a diagonal it also skewed the drawn angle away from the 45 degrees the hop
      // actually travels.
      const startSX = startWorldX - viewLeft;
      const startSY = startWorldY - viewTop;
      const endSX = endWorldX - viewLeft;
      const endSY = endWorldY - viewTop;

      if (startSX < -TILE_PX && endSX < -TILE_PX) continue;
      if (startSX > snesW + TILE_PX && endSX > snesW + TILE_PX) continue;
      if (startSY < -TILE_PX && endSY < -TILE_PX) continue;
      if (startSY > snesH + TILE_PX && endSY > snesH + TILE_PX) continue;

      const x1 = startSX * scaleX;
      const y1 = startSY * scaleY;
      const x2 = endSX * scaleX;
      const y2 = endSY * scaleY;

      const angle = Math.atan2(y2 - y1, x2 - x1);
      const headLen = TILE_PX * Math.min(scaleX, scaleY) * 0.5;
      const spread = 0.5;
      const shaftWidth = Math.max(1.5, 2 * Math.min(scaleX, scaleY));

      ctx.lineWidth = shaftWidth;
      const dx = Math.cos(angle) * headLen * 0.85;
      const dy = Math.sin(angle) * headLen * 0.85;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2 - dx, y2 - dy);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headLen * Math.cos(angle - spread), y2 - headLen * Math.sin(angle - spread));
      ctx.lineTo(x2 - headLen * Math.cos(angle + spread), y2 - headLen * Math.sin(angle + spread));
      ctx.closePath();
      ctx.fill();
    }
  }
};

const drawStairArrows = (dc: DrawContext, drawResults: FloodFillResult[]): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, snesH, TILE_PX, getScreenWorldOrigin } = dc;

  ctx.globalAlpha = 0.8;
  for (const drawResult of drawResults) {
    if (!drawResult.attrGrid) continue;
    const origin = getScreenWorldOrigin(drawResult.screenIndex);
    const visited = new Set<string>();
    for (let r = 0; r < 64; r++) {
      for (let c = 0; c < 64; c++) {
        if (drawResult.reachable[r][c] !== STAIRS_TRAVERSAL_STATE) continue;
        if (visited.has(`${r},${c}`)) continue;
        let minR = r, maxR = r;
        visited.add(`${r},${c}`);
        let nr = r + 1;
        while (nr < 64 && drawResult.reachable[nr][c] === STAIRS_TRAVERSAL_STATE) {
          visited.add(`${nr},${c}`);
          maxR = nr;
          nr++;
        }
        if (maxR - minR < 1) continue;

        const startWorldX = origin.x + c * TILE_PX + TILE_PX / 2;
        const startWorldY = origin.y + minR * TILE_PX;
        const endWorldX = origin.x + c * TILE_PX + TILE_PX / 2;
        const endWorldY = origin.y + (maxR + 1) * TILE_PX;

        const startSX = startWorldX - viewLeft;
        const startSY = startWorldY - viewTop;
        const endSX = endWorldX - viewLeft;
        const endSY = endWorldY - viewTop;

        if (startSY > snesH + TILE_PX && endSY > snesH + TILE_PX) continue;
        if (startSY < -TILE_PX && endSY < -TILE_PX) continue;

        const x1 = startSX * scaleX;
        const y1 = startSY * scaleY;
        const x2 = endSX * scaleX;
        const y2 = endSY * scaleY;

        const angle = Math.atan2(y2 - y1, x2 - x1);
        const lineLen = Math.hypot(x2 - x1, y2 - y1);
        const headLen = Math.min(TILE_PX * Math.min(scaleX, scaleY) * 0.5, lineLen * 0.25);
        const spread = 0.5;
        const shaftWidth = Math.max(1.5, 2 * Math.min(scaleX, scaleY));

        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = shaftWidth;
        const dx = Math.cos(angle) * headLen * 0.85;
        const dy = Math.sin(angle) * headLen * 0.85;
        ctx.beginPath();
        ctx.moveTo(x1 + dx, y1 + dy);
        ctx.lineTo(x2 - dx, y2 - dy);
        ctx.stroke();
        // Bottom arrowhead
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLen * Math.cos(angle - spread), y2 - headLen * Math.sin(angle - spread));
        ctx.lineTo(x2 - headLen * Math.cos(angle + spread), y2 - headLen * Math.sin(angle + spread));
        ctx.closePath();
        ctx.fill();
        // Top arrowhead
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - headLen * Math.cos(angle - spread + Math.PI), y1 - headLen * Math.sin(angle - spread + Math.PI));
        ctx.lineTo(x1 - headLen * Math.cos(angle + spread + Math.PI), y1 - headLen * Math.sin(angle + spread + Math.PI));
        ctx.closePath();
        ctx.fill();
      }
    }
  }
};

export { drawCliffArrows, drawStairArrows };
