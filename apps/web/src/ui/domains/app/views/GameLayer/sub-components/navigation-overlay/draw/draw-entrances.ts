/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@shared/game/navigation';
import { isEntranceUsable } from '@shared/game/navigation';
import type { DrawContext } from './draw-context';
import { EDGE_COLORS } from '../navigation-overlay.type';
import { getEntranceIcon } from '../../../../../../../../lib/entrance-icons';

const iconImageCache = new Map<string, HTMLImageElement>();

const getIconImageForEntrance = (entId: number, roomId: number, roomIndex: number, isIndoors: boolean, respawnEntIds: Set<number>): HTMLImageElement | null => {
  const { icon, color } = getEntranceIcon(entId, roomId, roomIndex, isIndoors, respawnEntIds);
  const key = `${icon.body.slice(0, 30)}_${color}`;
  if (iconImageCache.has(key)) return iconImageCache.get(key)!;
  const w = icon.width ?? 512;
  const h = icon.height ?? 512;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${icon.body.replace(/currentColor/g, color)}</svg>`;
  const img = new Image();
  img.src = 'data:image/svg+xml;base64,' + btoa(svg);
  iconImageCache.set(key, img);
  return img;
};

const drawEntrances = (dc: DrawContext, drawResults: FloodFillResult[], isIndoors: boolean, roomIndex: number, respawnEntIds: Set<number>): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, snesW, snesH, TILE_PX, getScreenWorldOrigin } = dc;

  ctx.globalAlpha = 0.95;
  ctx.fillStyle = EDGE_COLORS.entrance;
  for (const drawResult of drawResults) {
    const origin = getScreenWorldOrigin(drawResult.screenIndex);
    for (const ent of drawResult.entrances) {
      if (!isEntranceUsable(drawResult, ent)) continue;
      const xOffset = (!isIndoors && ent.id < 200) ? 8 : 0;
      const worldX = origin.x + ent.gridCol * TILE_PX + xOffset;
      const worldY = origin.y + ent.gridRow * TILE_PX;
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

      const iconImg = getIconImageForEntrance(ent.id, ent.roomId, roomIndex, isIndoors, respawnEntIds);
      if (iconImg && iconImg.complete && iconImg.naturalWidth > 0) {
        const pad = Math.max(1, dw * 0.1);
        ctx.globalAlpha = 0.9;
        ctx.drawImage(iconImg, dx + pad, dy + pad, dw - pad * 2, dh - pad * 2);
      }
    }
  }
};

export { drawEntrances };
