/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import type { DrawContext } from './draw.type';

const drawFloodStart = (dc: DrawContext, primaryResult: FloodFillResult | undefined): void => {
  if (!primaryResult?.startPos) return;
  const { ctx, scaleX, scaleY, viewLeft, viewTop, TILE_PX, dotRadius } = dc;
  const spWorldX = dc.screenWorldX + primaryResult.startPos.col * TILE_PX + TILE_PX / 2;
  const spWorldY = dc.screenWorldY + primaryResult.startPos.row * TILE_PX + TILE_PX / 2;
  const spSX = (spWorldX - viewLeft) * scaleX;
  const spSY = (spWorldY - viewTop) * scaleY;
  const spR = Math.max(4, dotRadius * 1.1);
  ctx.globalAlpha = 1.0;
  ctx.beginPath();
  ctx.arc(spSX, spSY, spR + 1.5, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(spSX, spSY, spR, 0, Math.PI * 2);
  ctx.fillStyle = '#000';
  ctx.fill();
};

export { drawFloodStart };
