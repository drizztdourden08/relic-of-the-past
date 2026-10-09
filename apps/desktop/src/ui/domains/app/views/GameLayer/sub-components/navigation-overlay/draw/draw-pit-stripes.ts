/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@shared/game/navigation';
import { GRID_SIZE } from '@shared/game/navigation/types/grid.constants';
import type { DrawContext } from './draw.type';
import { PIT_ATTR, PIT_STRIPE_COLOR } from './draw.constants';

const touchesReachableTile = (reachable: number[][], r: number, c: number): boolean => {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && reachable[nr][nc] === 1) return true;
    }
  }
  return false;
};

const drawPitStripes = (dc: DrawContext, drawResults: FloodFillResult[]): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, snesW, snesH, TILE_PX, getScreenWorldOrigin } = dc;

  ctx.globalAlpha = 0.45;
  const stripeSize = Math.max(2, 3 * Math.min(scaleX, scaleY));
  for (const drawResult of drawResults) {
    if (!drawResult.attrGrid) continue;
    const origin = getScreenWorldOrigin(drawResult.screenIndex);
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (drawResult.attrGrid[r][c] !== PIT_ATTR) continue;
        if (!touchesReachableTile(drawResult.reachable, r, c)) continue;

        const screenX = origin.x + c * TILE_PX - viewLeft;
        const screenY = origin.y + r * TILE_PX - viewTop;
        if (screenX < -TILE_PX || screenX > snesW + TILE_PX) continue;
        if (screenY < -TILE_PX || screenY > snesH + TILE_PX) continue;

        const dx = screenX * scaleX;
        const dy = screenY * scaleY;
        const tw = TILE_PX * scaleX;
        const th = TILE_PX * scaleY;

        ctx.save();
        ctx.beginPath();
        ctx.rect(dx, dy, tw, th);
        ctx.clip();
        ctx.strokeStyle = PIT_STRIPE_COLOR;
        ctx.lineWidth = stripeSize * 0.7;
        for (let s = -tw; s < tw + th; s += stripeSize * 2) {
          ctx.beginPath();
          ctx.moveTo(dx + s, dy + th);
          ctx.lineTo(dx + s + th, dy);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }
};

export { drawPitStripes };
