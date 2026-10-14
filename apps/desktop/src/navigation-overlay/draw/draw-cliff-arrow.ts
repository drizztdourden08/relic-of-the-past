/* @layer renderer-components @kind logic */
import type { LedgeTraversal } from '@rotp/game-core';
import type { DrawContext, ScreenOrigin } from './draw.type';
import { ARROW_HEAD_SPREAD } from './draw.constants';
import { isSegmentOffscreen } from './is-segment-offscreen';

const drawCliffArrow = (dc: DrawContext, origin: ScreenOrigin, ledge: LedgeTraversal): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, TILE_PX } = dc;
  const startWorldX = origin.x + ledge.startCol * TILE_PX + TILE_PX / 2;
  const startWorldY = origin.y + ledge.startRow * TILE_PX + TILE_PX / 2;
  const endWorldX = origin.x + ledge.endCol * TILE_PX + TILE_PX / 2;
  const endWorldY = origin.y + ledge.endRow * TILE_PX + TILE_PX / 2;
  if (endWorldX === startWorldX && endWorldY === startWorldY) return;

  const startSX = startWorldX - viewLeft;
  const startSY = startWorldY - viewTop;
  const endSX = endWorldX - viewLeft;
  const endSY = endWorldY - viewTop;
  if (isSegmentOffscreen(dc, { x: startSX, y: startSY }, { x: endSX, y: endSY })) return;

  const x1 = startSX * scaleX;
  const y1 = startSY * scaleY;
  const x2 = endSX * scaleX;
  const y2 = endSY * scaleY;

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = TILE_PX * Math.min(scaleX, scaleY) * 0.5;
  ctx.lineWidth = Math.max(1.5, 2 * Math.min(scaleX, scaleY));
  const dx = Math.cos(angle) * headLen * 0.85;
  const dy = Math.sin(angle) * headLen * 0.85;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - dx, y2 - dy);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - ARROW_HEAD_SPREAD), y2 - headLen * Math.sin(angle - ARROW_HEAD_SPREAD));
  ctx.lineTo(x2 - headLen * Math.cos(angle + ARROW_HEAD_SPREAD), y2 - headLen * Math.sin(angle + ARROW_HEAD_SPREAD));
  ctx.closePath();
  ctx.fill();
};

export { drawCliffArrow };
