/* @layer renderer-components @kind logic */
import type { PitCellInput } from './draw-pit-cell.type';
import { PIT_ATTR, PIT_STRIPE_COLOR } from './draw.constants';
import { isOffscreen } from './is-offscreen';
import { touchesReachableTile } from './touches-reachable-tile';

const drawPitCell = (input: PitCellInput): void => {
  const { dc, drawResult, origin, r, c, stripeSize } = input;
  if (drawResult.attrGrid?.[r]?.[c] !== PIT_ATTR) return;
  if (!touchesReachableTile(drawResult.reachable, r, c)) return;

  const { ctx, scaleX, scaleY, viewLeft, viewTop, TILE_PX } = dc;
  const screenX = origin.x + c * TILE_PX - viewLeft;
  const screenY = origin.y + r * TILE_PX - viewTop;
  if (isOffscreen(dc, screenX, screenY)) return;

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
};

export { drawPitCell };
