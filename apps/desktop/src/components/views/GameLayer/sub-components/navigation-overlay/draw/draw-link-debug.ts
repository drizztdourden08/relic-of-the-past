/* @layer renderer-components @kind logic */
import type { DrawContext, ViewportInfo } from './draw-context';

interface LiveSprite {
  x: number;
  y: number;
  type: number;
  state: number;
  subtype: number;
  subtype2: number;
  slot: number;
  e: number;
}

const drawLinkDebug = (dc: DrawContext, vp: ViewportInfo, liveSprites: LiveSprite[]): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, TILE_PX, screenWorldX, screenWorldY, width, height } = dc;

  ctx.globalAlpha = 1.0;
  const linkWorldX = vp.linkX;
  const linkWorldY = vp.linkY + 8;
  const linkSX = (linkWorldX - viewLeft) * scaleX;
  const linkSY = (linkWorldY - viewTop) * scaleY;
  const linkW = 16 * scaleX;
  const linkH = 16 * scaleY;

  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  ctx.strokeRect(linkSX, linkSY, linkW, linkH);

  const linkRelX = linkWorldX - screenWorldX;
  const linkRelY = linkWorldY - screenWorldY;
  const tileMinCol = Math.floor(linkRelX / TILE_PX);
  const tileMaxCol = Math.floor((linkRelX + 15) / TILE_PX);
  const tileMinRow = Math.floor(linkRelY / TILE_PX);
  const tileMaxRow = Math.floor((linkRelY + 15) / TILE_PX);

  ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
  ctx.lineWidth = 1;
  for (let r = tileMinRow; r <= tileMaxRow; r++) {
    for (let c = tileMinCol; c <= tileMaxCol; c++) {
      const twx = (screenWorldX + c * TILE_PX - viewLeft) * scaleX;
      const twy = (screenWorldY + r * TILE_PX - viewTop) * scaleY;
      ctx.strokeRect(twx, twy, TILE_PX * scaleX, TILE_PX * scaleY);
    }
  }

  if (liveSprites.length > 0) {
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#ff2222';
    ctx.lineWidth = Math.max(1.5, 2.5 * Math.min(scaleX, scaleY));
    for (const s of liveSprites) {
      if (s.type !== 0x3f && s.type !== 0x40 && !(s.type === 0x73 && s.e === 0)) continue;
      const worldX = s.x - 8;
      const worldY = s.y - 8;
      const sx = (worldX - viewLeft) * scaleX;
      const sy = (worldY - viewTop) * scaleY;
      const sw = 32 * scaleX;
      const sh = 32 * scaleY;
      if (sx + sw < 0 || sy + sh < 0 || sx > width || sy > height) continue;
      ctx.strokeRect(sx, sy, sw, sh);
    }
  }
};

export { drawLinkDebug };
