/* @layer renderer-components @kind logic */
/**
 * Draws ScreenAnnotations. One marker shape for everything, differing only by glyph and colour,
 * so the overlay stays readable at 8px tiles; `open`/`done` draws dimmed.
 */
import type { ScreenAnnotation, ScreenAnnotations } from '@shared/game/simulation';
import type { DrawContext } from './draw-context';
import { ANNOTATION_STYLES } from '../annotation-style';

/**
 * Real door-table kinds. NOT the cell lock: that is a keyhole PLATE (room object 0x18) with no
 * door-table record and a dummy direction (see getRoomDoors), so it keeps the 2x2 sizing. A door
 * block is 4x4 tiles, wide ALONG the wall and shallow THROUGH it ('n'/'s' wide in columns, 'e'/'w'
 * wide in rows), so sizing every door the same only centers one orientation.
 */
const DOOR_KINDS: ReadonlySet<ScreenAnnotation['kind']> = new Set([
  'key-door', 'big-key-door', 'shutter', 'bombable', 'follower-gate', 'warp-door', 'exit-door',
]);

/**
 * Kinds whose `tile` is a WALKABLE POSITION, not an object record's top-left corner, so the
 * corner-anchor nudge must NOT apply. `exit` is the flood's own crossing tile; `exitFromEdge`
 * reports row/col 63, so a nudge pushed the marker onto the adjacent screen's first tile.
 */
const WALK_TILE_KINDS: ReadonlySet<ScreenAnnotation['kind']> = new Set(['exit']);

/**
 * Records name the TOP-LEFT tile of a block, so markers are nudged in along their narrow axis
 * (both axes for a 2x2 block, only the through-wall axis for a 4x4 door). Measured from
 * screenshots of room 0x71 and the jail cell, not derived; re-check if the marker size changes.
 */
const ANCHOR_NUDGE_TILES = 1;

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

    // Only a door's narrow through-wall axis needs the nudge; its wide axis starts flush.
    const isDoor = DOOR_KINDS.has(a.kind);
    const onWalkTile = WALK_TILE_KINDS.has(a.kind);
    const wideCols = isDoor && (a.direction === 'n' || a.direction === 's');
    const wideRows = isDoor && (a.direction === 'e' || a.direction === 'w');
    const sizeCols = TILE_PX * (wideCols ? 4 : 2);
    const sizeRows = TILE_PX * (wideRows ? 4 : 2);
    const nudgeCols = wideCols || onWalkTile ? 0 : nudge;
    const nudgeRows = wideRows || onWalkTile ? 0 : nudge;

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

    // Body: hatched while shut/blocking, flat-dim once resolved.
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

    // Unreachable: strike it through so it is visible on the canvas, not only in the widget list.
    if (blocked) {
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = '#d2534f';
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
