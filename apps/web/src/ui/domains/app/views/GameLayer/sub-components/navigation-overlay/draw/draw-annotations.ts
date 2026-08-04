/* @layer renderer-components @kind logic */
/**
 * Draws ScreenAnnotations — everything the simulator knows about a screen that
 * used to be invisible: chests, key/big-key/cell locks, shutters and their trap
 * state, bombable walls, key-carrier enemies, pull switches, NPC checks, warp and
 * exit doors, the follower-gated wall, and the traversable exits with walk distance.
 *
 * One marker shape for everything, differing only by glyph and colour, so the
 * overlay stays readable at 8px tiles. A `shut` state draws a hatched fill and an
 * `open`/`done` one draws dimmed, so lock state reads without the legend.
 */
import type { ScreenAnnotation, ScreenAnnotations } from '@shared/game/simulation';
import type { DrawContext } from './draw-context';
import { ANNOTATION_STYLES } from '../annotation-style';

/**
 * Real door-table kinds — NOT the cell lock, which is a jail-cell keyhole
 * PLATE (room object 0x18) rather than a wall opening; it carries no door-table
 * record and its direction is a dummy constant (see getRoomDoors), so it stays
 * on the uniform 2x2 sizing below. The game draws a real door block 4x4 tiles
 * (32px); a door record is wide ALONG the wall and shallow THROUGH it — 'n'/'s'
 * doors sit in a horizontal wall (wide in columns), 'e'/'w' doors sit in a
 * vertical wall (wide in rows) — so sizing/nudging every door the same
 * regardless of direction only centers one orientation and leaves the other
 * sitting off to one side of the real opening.
 */
const DOOR_KINDS: ReadonlySet<ScreenAnnotation['kind']> = new Set([
  'key-door', 'big-key-door', 'shutter', 'bombable', 'follower-gate', 'warp-door', 'exit-door',
]);

/**
 * Kinds whose `tile` is a WALKABLE POSITION, not the top-left corner of an
 * object record — so the corner-anchor nudge below must NOT apply to them.
 *
 * `exit` carries the flood's own crossing tile (`SimExit.fromTile`, straight
 * from a BFS transition or `exitFromEdge`), which is the exact spot the player
 * stands to leave. Nudging it moves the marker onto a neighbouring tile that
 * has nothing to do with the crossing — and for a border crossing it is worse
 * than cosmetic: `exitFromEdge` reports row/col 63, the last tile before the
 * next screen's origin, so 8px of nudge pushes the marker off this screen
 * entirely and onto whatever the adjacent screen happens to start with, which
 * is how these landed on visibly unreachable tiles.
 */
const WALK_TILE_KINDS: ReadonlySet<ScreenAnnotation['kind']> = new Set(['exit']);

/**
 * Records name the TOP-LEFT tile of a feature's block. A 16px marker anchored at
 * the corner therefore sits up-left of what it points at, so every marker is
 * nudged in along its narrow axis (both axes for a 2x2 sprite/chest block; only
 * the through-wall axis for a 4x4 door block, since the wide axis already
 * starts flush with the record's own left/top edge).
 *
 * Verified against room 0x71 (key door, both trap shutters) and the Jail Cell
 * (cell lock, chest, big-key guard) — measured from screenshots, not derived, so
 * re-check it if the marker size changes.
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

    // A door's wide axis runs ALONG the wall it sits in ('n'/'s' → columns,
    // 'e'/'w' → rows) and starts flush with the record's own tile, so only the
    // narrow through-wall axis needs the corner-anchor nudge. Everything else
    // (sprites, chests) is a uniform 2x2 block nudged on both axes.
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

    // Unreachable: strike it through, so "the run cannot get here" is visible on
    // the canvas and not only in the widget list.
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
