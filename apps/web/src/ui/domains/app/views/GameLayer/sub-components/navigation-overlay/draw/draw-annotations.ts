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

/** Kinds hidden by default — the flood already draws these its own way. */
const REDUNDANT: ReadonlySet<ScreenAnnotation['kind']> = new Set(['entrance', 'fall-hole']);

/**
 * Records name the TOP-LEFT tile of a feature's block, and the game draws those
 * blocks 4x4 tiles (32px) for doors and 2x2 for sprites/chests. A 16px marker
 * anchored at the corner therefore sits up-left of what it points at, so every
 * marker is nudged one tile in on both axes.
 *
 * Verified against room 0x71 (key door, both trap shutters) and the Jail Cell
 * (cell lock, chest, big-key guard) — measured from screenshots, not derived, so
 * re-check it if the marker size changes.
 */
const ANCHOR_NUDGE_TILES = 1;

const drawAnnotations = (dc: DrawContext, sets: readonly ScreenAnnotations[], hidden?: ReadonlySet<string>): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, snesW, snesH, TILE_PX, getScreenWorldOrigin } = dc;
  const size = TILE_PX * 2;
  const nudge = ANCHOR_NUDGE_TILES * TILE_PX;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const set of sets) {
  const origin = getScreenWorldOrigin(set.screenIndex);
  for (const a of set.items) {
    const style = ANNOTATION_STYLES[a.kind] ?? ANNOTATION_STYLES.unknown;
    if (style.panelOnly) continue;
    if (REDUNDANT.has(a.kind) || hidden?.has(a.kind)) continue;

    const screenX = origin.x + a.tile.col * TILE_PX + nudge - viewLeft;
    const screenY = origin.y + a.tile.row * TILE_PX + nudge - viewTop;
    if (screenX < -size || screenX > snesW + size) continue;
    if (screenY < -size || screenY > snesH + size) continue;

    const dx = screenX * scaleX;
    const dy = screenY * scaleY;
    const dw = size * scaleX;
    const dh = size * scaleY;
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
