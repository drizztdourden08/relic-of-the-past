/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@shared/game/navigation';
import type { ReachState } from '@shared/game/navigation/types';
import { STAIRS_TRAVERSAL_STATE } from '@shared/game/navigation/types';
import { DRAW_DOTS_LEDGE_ATTRS } from '@shared/game/data/native-tables';
import type { DrawContext } from './draw-context';

const DOT_COLOR_REACHABLE = 'rgba(80, 200, 255, 0.6)';
const DOT_COLOR_REQ = 'rgba(255, 100, 180, 0.35)';

/** Ring colour by which layer(s) reached the tile — ground (layer 1), above (layer 0), or both. */
const RING_COLOR_GROUND = '#5b9bd5';
const RING_COLOR_ABOVE = '#c8a84e';
const RING_COLOR_BOTH = '#000';

const drawReachableDots = (dc: DrawContext, drawResults: FloodFillResult[], layer1ReachableOverride: [ReachState[][], ReachState[][]] | null): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, snesW, snesH, TILE_PX, dotRadius, getScreenWorldOrigin } = dc;

  ctx.globalAlpha = 0.55;
  for (const drawResult of drawResults) {
    const origin = getScreenWorldOrigin(drawResult.screenIndex);
    const perLayer = layer1ReachableOverride;
    const isDualLayer = !!perLayer;
    // A one-layer screen still sits on a layer, and the ring must name the SAME one
    // the tooltip does or the two disagree on the same tile. Outdoors is always the
    // ground; a single-layer room takes the layer the flood started on.
    const singleLayerIsAbove = !isDualLayer && drawResult.indoors && (drawResult.startLayer ?? 0) === 0;
    for (let r = 0; r < 64; r++) {
      for (let c = 0; c < 64; c++) {
        const layer0Reach = perLayer ? perLayer[0][r][c] !== 0 : false;
        const layer1Reach = perLayer ? perLayer[1][r][c] !== 0 : false;
        const mergedReachable = perLayer ? (layer0Reach || layer1Reach) : drawResult.reachable[r][c] === 1;
        if (!mergedReachable) continue;

        // A split (two-layer) dot means the flood genuinely REACHED the tile on both
        // layers. Keying this off raw attr content instead drew single-layer tiles that
        // merely have geometry on the other layer (e.g. a wall/object on the layer below
        // a reached upper floor) as misleading two-state dots.
        const hasOverlap = isDualLayer && layer0Reach && layer1Reach;

        // Judge the tile by the attrs of the layer it ACTUALLY STANDS ON.
        //
        // `attrGrid` is the upper/BG2 layer, so testing it for every tile checks a
        // ground-only dot against whatever sits ABOVE it — and above an open floor
        // that is a wall or a ledge almost by definition. The result is that every
        // reachable tile running alongside a raised walkway draws no dot at all:
        // e.g. ground 0x00 (plain floor, reachable) under above 0x02 (wall) vanished,
        // because 0x02 is in the skip set. Reached on the ground only? Then the
        // ground grid is the one that decides.
        //
        // DO NOT collapse this back to a single `attrGrid` read — that regression has
        // now happened twice, and it silently blanks large runs of correct dots.
        const dotAttr = isDualLayer && !layer0Reach
          ? drawResult.dualLayerGrids?.layer1?.[r]?.[c]
          : drawResult.attrGrid?.[r]?.[c];
        if (!hasOverlap && dotAttr !== undefined && DRAW_DOTS_LEDGE_ATTRS.has(dotAttr)) continue;
        if (perLayer && (perLayer[0][r][c] === STAIRS_TRAVERSAL_STATE || perLayer[1][r][c] === STAIRS_TRAVERSAL_STATE)) continue;
        // Skip dots for ledge traversal tiles (states 2-9) — arrows are drawn separately
        if (perLayer) {
          const s0 = perLayer[0][r][c];
          const s1 = perLayer[1][r][c];
          if ((s0 >= 2 && s0 <= 9) || (s1 >= 2 && s1 <= 9)) continue;
        }

        const worldX = origin.x + c * TILE_PX + TILE_PX / 2;
        const worldY = origin.y + r * TILE_PX + TILE_PX / 2;
        const screenX = worldX - viewLeft;
        const screenY = worldY - viewTop;
        if (screenX < -TILE_PX || screenX > snesW + TILE_PX) continue;
        if (screenY < -TILE_PX || screenY > snesH + TILE_PX) continue;

        const dx = screenX * scaleX;
        const dy = screenY * scaleY;
        const hasReq = drawResult.reqGrid && drawResult.reqGrid[r][c] !== '';
        const radius = dotRadius * 0.6;

        // Fill conveys the flood result only — identical on both layers. The ring
        // (drawn next) is what conveys which layer(s) reached the tile.
        ctx.fillStyle = hasReq ? DOT_COLOR_REQ : DOT_COLOR_REACHABLE;
        ctx.beginPath();
        ctx.arc(dx, dy, radius, 0, Math.PI * 2);
        ctx.fill();

        const ringColor = hasOverlap
          ? RING_COLOR_BOTH
          : ((isDualLayer ? layer0Reach : singleLayerIsAbove) ? RING_COLOR_ABOVE : RING_COLOR_GROUND);
        const ringAlpha = ctx.globalAlpha;
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = Math.max(1, Math.min(scaleX, scaleY) * 0.6);
        ctx.beginPath();
        ctx.arc(dx, dy, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = ringAlpha;
      }
    }
  }

  // Draw flood fill starting position as a black dot with white outline
  const primaryResult = drawResults[0];
  if (primaryResult?.startPos) {
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
  }

  // Draw hookshot targets as ordinary dots — hookshot-ability is already
  // reported in the tile tooltip, so no separate ring marks these tiles.
  ctx.globalAlpha = 0.7;
  for (const drawResult of drawResults) {
    if (!drawResult.hookTargets || drawResult.hookTargets.length === 0) continue;
    const origin = getScreenWorldOrigin(drawResult.screenIndex);
    for (const ht of drawResult.hookTargets) {
      const worldX = origin.x + ht.col * TILE_PX + TILE_PX / 2;
      const worldY = origin.y + ht.row * TILE_PX + TILE_PX / 2;
      const screenX = worldX - viewLeft;
      const screenY = worldY - viewTop;
      if (screenX < -TILE_PX || screenX > snesW + TILE_PX) continue;
      if (screenY < -TILE_PX || screenY > snesH + TILE_PX) continue;

      const dx = screenX * scaleX;
      const dy = screenY * scaleY;
      const hasReq = drawResult.reqGrid && drawResult.reqGrid[ht.row]?.[ht.col] !== '';
      ctx.fillStyle = hasReq ? DOT_COLOR_REQ : DOT_COLOR_REACHABLE;
      ctx.beginPath();
      ctx.arc(dx, dy, dotRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

export { drawReachableDots };
