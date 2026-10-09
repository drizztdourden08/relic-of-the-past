/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import type { DrawContext } from './draw.type';
import type { FallHoleSpawn } from '../../../../../stores/navigation-overlay-store';
import { FALL_ZONE_COLOR } from './draw.constants';

const drawFallHoleSpawns = (dc: DrawContext, fallHoleSpawns: FallHoleSpawn[], activeScreenIndex: number, drawResults: FloodFillResult[]): void => {
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
    ctx.strokeStyle = FALL_ZONE_COLOR;
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
    ctx.strokeStyle = FALL_ZONE_COLOR;
    ctx.lineWidth = Math.max(1.5, 2 * Math.min(scaleX, scaleY));
    ctx.strokeRect(dx, dy, dw, dh);
    ctx.restore();
  }
};

export { drawFallHoleSpawns };
