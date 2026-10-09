/* @layer renderer-components @kind logic */
import type { ScreenAnnotations } from '@rotp/navigation';
import type { DrawContext } from './draw.type';
import { ANNOTATION_STYLES } from '../annotation-style';
import { ANCHOR_NUDGE_TILES, BLOCKED_STRIKE_COLOR, DOOR_KINDS } from './draw.constants';

const drawAnnotations = (dc: DrawContext, sets: readonly ScreenAnnotations[], hidden?: ReadonlySet<string>): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, snesW, snesH, TILE_PX, getScreenWorldOrigin } = dc;
  const nudge = ANCHOR_NUDGE_TILES * TILE_PX;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const set of sets) {
    const origin = getScreenWorldOrigin(set.screenIndex);
    for (const a of set.items) {
      const style = ANNOTATION_STYLES[a.kind] ?? ANNOTATION_STYLES.unknown;
      if (style.panelOnly) continue;
      if (hidden?.has(a.kind)) continue;

      const isDoor = DOOR_KINDS.has(a.kind);
      const wideCols = isDoor && (a.direction === 'n' || a.direction === 's');
      const wideRows = isDoor && (a.direction === 'e' || a.direction === 'w');
      const sizeCols = TILE_PX * (wideCols ? 4 : 2);
      const sizeRows = TILE_PX * (wideRows ? 4 : 2);
      const nudgeCols = wideCols ? 0 : nudge;
      const nudgeRows = wideRows ? 0 : nudge;

      const screenX = origin.x + a.tile.col * TILE_PX + nudgeCols - viewLeft;
      const screenY = origin.y + a.tile.row * TILE_PX + nudgeRows - viewTop;
      if (screenX < -sizeCols || screenX > snesW + sizeCols) continue;
      if (screenY < -sizeRows || screenY > snesH + sizeRows) continue;

      const dx = screenX * scaleX;
      const dy = screenY * scaleY;
      const dw = sizeCols * scaleX;
      const dh = sizeRows * scaleY;
      const settled = a.state === 'open' || a.state === 'done';
      const blocked = a.state === 'blocked';

      ctx.globalAlpha = settled ? 0.22 : 0.42;
      ctx.fillStyle = style.color;
      ctx.fillRect(dx, dy, dw, dh);

      ctx.globalAlpha = settled ? 0.5 : 0.95;
      ctx.strokeStyle = style.color;
      ctx.lineWidth = Math.max(1.25, 1.75 * Math.min(scaleX, scaleY));
      ctx.strokeRect(dx, dy, dw, dh);

      ctx.fillStyle = settled ? style.color : '#fff';
      ctx.font = `${Math.max(8, dh * 0.72)}px monospace`;
      ctx.fillText(style.glyph, dx + dw / 2, dy + dh / 2 + dh * 0.04);

      if (blocked) {
        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = BLOCKED_STRIKE_COLOR;
        ctx.lineWidth = Math.max(1.5, 2 * Math.min(scaleX, scaleY));
        ctx.beginPath();
        ctx.moveTo(dx, dy + dh);
        ctx.lineTo(dx + dw, dy);
        ctx.stroke();
      }
    }
  }

  ctx.restore();
};

export { drawAnnotations };
