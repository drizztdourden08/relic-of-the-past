/* @layer renderer-components @kind logic */
import type { ScreenCrossing, ScreenCrossings } from '@rotp/game-core';
import { markerCrossings, crossingIcon } from '@rotp/navigation';
import type { DrawContext } from './draw.type';
import { ENTRANCE_COLOR } from '../navigation-overlay.constants';

const iconImageCache = new Map<string, HTMLImageElement>();

const getIconImageFor = (crossing: ScreenCrossing): HTMLImageElement | null => {
  const { icon, color } = crossingIcon(crossing);
  const key = `${icon.body.slice(0, 30)}_${color}`;
  const cached = iconImageCache.get(key);
  if (cached) return cached;
  const w = icon.width ?? 512;
  const h = icon.height ?? 512;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${icon.body.replace(/currentColor/g, color)}</svg>`;
  const img = new Image();
  img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
  iconImageCache.set(key, img);
  return img;
};

const drawEntrances = (dc: DrawContext, crossings: readonly ScreenCrossings[], isIndoors: boolean): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, snesW, snesH, TILE_PX, getScreenWorldOrigin } = dc;

  ctx.globalAlpha = 0.95;
  ctx.fillStyle = ENTRANCE_COLOR;
  for (const screen of crossings) {
    const origin = getScreenWorldOrigin(screen.screenIndex);
    for (const crossing of markerCrossings(screen, isIndoors)) {
      const worldX = origin.x + crossing.tile.col * TILE_PX;
      const worldY = origin.y + crossing.tile.row * TILE_PX;
      const screenX = worldX - viewLeft;
      const screenY = worldY - viewTop;
      if (screenX < -TILE_PX * 2 || screenX > snesW + TILE_PX) continue;
      if (screenY < -TILE_PX * 2 || screenY > snesH + TILE_PX) continue;

      const dx = screenX * scaleX;
      const dy = screenY * scaleY;
      const dw = TILE_PX * 2 * scaleX;
      const dh = TILE_PX * 2 * scaleY;

      ctx.globalAlpha = 0.4;
      ctx.fillRect(dx, dy, dw, dh);
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = '#ffcc44';
      ctx.lineWidth = Math.max(1.5, 2 * Math.min(scaleX, scaleY));
      ctx.strokeRect(dx, dy, dw, dh);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(dx - 0.5, dy - 0.5, dw + 1, dh + 1);

      const iconImg = getIconImageFor(crossing);
      if (iconImg && iconImg.complete && iconImg.naturalWidth > 0) {
        const pad = Math.max(1, dw * 0.1);
        ctx.globalAlpha = 0.9;
        ctx.drawImage(iconImg, dx + pad, dy + pad, dw - pad * 2, dh - pad * 2);
      }
    }
  }
};

export { drawEntrances };
