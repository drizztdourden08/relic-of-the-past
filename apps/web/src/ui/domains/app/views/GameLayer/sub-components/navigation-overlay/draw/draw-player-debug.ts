/* @layer renderer-components @kind logic */
import type { DrawContext, LiveSprite, ViewportInfo } from './draw.type';
import {
  BARRIER_SPRITE, BLOCKER_BOX_PX, PLAYER_BOX_PX, PLAYER_FOOT_OFFSET, TUTORIAL_GUARD_SPRITE, UNCLE_SPRITE,
} from './draw.constants';

const isBlockerSprite = (s: LiveSprite): boolean =>
  s.type === TUTORIAL_GUARD_SPRITE || s.type === BARRIER_SPRITE || (s.type === UNCLE_SPRITE && s.e === 0);

const drawBlockerSprites = (dc: DrawContext, liveSprites: LiveSprite[]): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, width, height } = dc;
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#ff2222';
  ctx.lineWidth = Math.max(1.5, 2.5 * Math.min(scaleX, scaleY));
  for (const s of liveSprites) {
    if (!isBlockerSprite(s)) continue;
    const worldX = s.x - 8;
    const worldY = s.y - 8;
    const sx = (worldX - viewLeft) * scaleX;
    const sy = (worldY - viewTop) * scaleY;
    const sw = BLOCKER_BOX_PX * scaleX;
    const sh = BLOCKER_BOX_PX * scaleY;
    if (sx + sw < 0 || sy + sh < 0 || sx > width || sy > height) continue;
    ctx.strokeRect(sx, sy, sw, sh);
  }
};

const drawPlayerDebug = (dc: DrawContext, vp: ViewportInfo, liveSprites: LiveSprite[]): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, TILE_PX, screenWorldX, screenWorldY } = dc;

  ctx.globalAlpha = 1.0;
  const playerWorldX = vp.linkX;
  const playerWorldY = vp.linkY + PLAYER_FOOT_OFFSET;
  const playerSX = (playerWorldX - viewLeft) * scaleX;
  const playerSY = (playerWorldY - viewTop) * scaleY;
  const playerW = PLAYER_BOX_PX * scaleX;
  const playerH = PLAYER_BOX_PX * scaleY;

  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  ctx.strokeRect(playerSX, playerSY, playerW, playerH);

  const playerRelX = playerWorldX - screenWorldX;
  const playerRelY = playerWorldY - screenWorldY;
  const tileMinCol = Math.floor(playerRelX / TILE_PX);
  const tileMaxCol = Math.floor((playerRelX + PLAYER_BOX_PX - 1) / TILE_PX);
  const tileMinRow = Math.floor(playerRelY / TILE_PX);
  const tileMaxRow = Math.floor((playerRelY + PLAYER_BOX_PX - 1) / TILE_PX);

  ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
  ctx.lineWidth = 1;
  for (let r = tileMinRow; r <= tileMaxRow; r++) {
    for (let c = tileMinCol; c <= tileMaxCol; c++) {
      const twx = (screenWorldX + c * TILE_PX - viewLeft) * scaleX;
      const twy = (screenWorldY + r * TILE_PX - viewTop) * scaleY;
      ctx.strokeRect(twx, twy, TILE_PX * scaleX, TILE_PX * scaleY);
    }
  }

  if (liveSprites.length > 0) drawBlockerSprites(dc, liveSprites);
};

export { drawPlayerDebug };
