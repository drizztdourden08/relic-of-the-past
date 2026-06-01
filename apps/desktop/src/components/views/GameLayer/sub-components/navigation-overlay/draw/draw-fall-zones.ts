import type { FloodFillResult } from '@shared/game/navigation';
import type { DrawContext } from './draw-context';
import type { FallHoleSpawn } from '../../../../../../stores/navigation-overlay-store';

export function drawFallHoleSpawns(
  dc: DrawContext,
  fallHoleSpawns: FallHoleSpawn[],
  activeScreenIndex: number,
  drawResults: FloodFillResult[],
): void {
  if (fallHoleSpawns.length === 0) return;
  const { ctx, scaleX, scaleY, viewLeft, viewTop, snesW, snesH, TILE_PX, getScreenWorldOrigin } = dc;

  const origin = getScreenWorldOrigin(drawResults[0]?.screenIndex ?? activeScreenIndex);
  for (const fh of fallHoleSpawns) {
    const worldX = origin.x + fh.gridCol * TILE_PX;
    const worldY = origin.y + fh.gridRow * TILE_PX;
    const screenX = worldX - viewLeft;
    const screenY = worldY - viewTop;
    if (screenX < -TILE_PX * 4 || screenX > snesW + TILE_PX * 4) continue;
    if (screenY < -TILE_PX * 4 || screenY > snesH + TILE_PX * 4) continue;

    const dx = screenX * scaleX;
    const dy = screenY * scaleY;
    const dw = TILE_PX * 2 * scaleX;
    const dh = TILE_PX * 2 * scaleY;

    ctx.save();
    ctx.beginPath();
    ctx.rect(dx, dy, dw, dh);
    ctx.clip();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = '#ffcc44';
    const stripe = Math.max(3, 4 * Math.min(scaleX, scaleY));
    ctx.lineWidth = stripe * 0.6;
    const steps = Math.ceil((dw + dh) / stripe) + 2;
    for (let s = -steps; s <= steps; s++) {
      const offset = s * stripe;
      ctx.beginPath();
      ctx.moveTo(dx + offset, dy);
      ctx.lineTo(dx + offset + dh, dy + dh);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = '#ffcc44';
    ctx.lineWidth = Math.max(1.5, 2 * Math.min(scaleX, scaleY));
    ctx.strokeRect(dx, dy, dw, dh);
    ctx.restore();
  }
}

export function drawPitStripes(dc: DrawContext, drawResults: FloodFillResult[]): void {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, snesW, snesH, TILE_PX, getScreenWorldOrigin } = dc;

  ctx.globalAlpha = 0.45;
  const stripeSize = Math.max(2, 3 * Math.min(scaleX, scaleY));
  for (const drawResult of drawResults) {
    if (!drawResult.attrGrid) continue;
    const origin = getScreenWorldOrigin(drawResult.screenIndex);
    for (let r = 0; r < 64; r++) {
      for (let c = 0; c < 64; c++) {
        if (drawResult.attrGrid[r][c] !== 0x20) continue;
        let nearReachable = false;
        for (let dr = -1; dr <= 1 && !nearReachable; dr++) {
          for (let dc2 = -1; dc2 <= 1 && !nearReachable; dc2++) {
            const nr = r + dr, nc = c + dc2;
            if (nr >= 0 && nr < 64 && nc >= 0 && nc < 64 && drawResult.reachable[nr][nc] === 1) {
              nearReachable = true;
            }
          }
        }
        if (!nearReachable) continue;

        const worldX = origin.x + c * TILE_PX;
        const worldY = origin.y + r * TILE_PX;
        const screenX = worldX - viewLeft;
        const screenY = worldY - viewTop;
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
        ctx.strokeStyle = '#ffcc00';
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
}
