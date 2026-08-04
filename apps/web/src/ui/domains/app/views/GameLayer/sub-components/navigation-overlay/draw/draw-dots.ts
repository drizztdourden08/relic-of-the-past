/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@shared/game/navigation';
import type { ReachState } from '@shared/game/navigation/types';
import { STAIRS_TRAVERSAL_STATE } from '@shared/game/navigation/types';
import type { DrawContext } from './draw-context';

const LEDGE_ATTRS = new Set([0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x01, 0x02, 0x03, 0x1a, 0x12, 0x11, 0x13, 0x19, 0x1b, 0x3d]);

const DOT_COLOR_REACHABLE = 'rgba(80, 200, 255, 0.6)';
const DOT_COLOR_UPPER = 'rgba(100, 215, 255, 0.65)';
const DOT_COLOR_LOWER = 'rgba(50, 165, 215, 0.55)';
const DOT_COLOR_REQ = 'rgba(255, 100, 180, 0.35)';

const drawReachableDots = (dc: DrawContext, drawResults: FloodFillResult[], layer1ReachableOverride: [ReachState[][], ReachState[][]] | null): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, snesW, snesH, TILE_PX, dotRadius, getScreenWorldOrigin } = dc;

  ctx.globalAlpha = 0.55;
  for (const drawResult of drawResults) {
    const origin = getScreenWorldOrigin(drawResult.screenIndex);
    const perLayer = layer1ReachableOverride;
    const isDualLayer = !!perLayer;
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

        // Judge the dot by the attrs of the layer it actually stands on. This
        // read layer 0's grid for every tile, so a GROUND-only dot was tested
        // against whatever sits above it — and above an open corridor that is
        // wall or ledge almost by definition, which blanked every flooded tile
        // running alongside a raised walkway.
        const dotAttr = isDualLayer && !layer0Reach
          ? drawResult.dualLayerGrids?.layer1?.[r]?.[c]
          : drawResult.attrGrid?.[r]?.[c];
        if (!hasOverlap && dotAttr !== undefined && LEDGE_ATTRS.has(dotAttr)) continue;
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

        if (hasOverlap) {
          const splitAlpha = ctx.globalAlpha;
          ctx.globalAlpha = 0.85;
          if (layer1Reach) {
            ctx.fillStyle = hasReq ? DOT_COLOR_REQ : DOT_COLOR_LOWER;
            ctx.beginPath();
            ctx.arc(dx, dy, radius, Math.PI * 0.5, Math.PI * 1.5);
            ctx.fill();
          }
          if (layer0Reach) {
            ctx.fillStyle = hasReq ? DOT_COLOR_REQ : DOT_COLOR_UPPER;
            ctx.beginPath();
            ctx.arc(dx, dy, radius, -Math.PI * 0.5, Math.PI * 0.5);
            ctx.fill();
          }
          if (layer0Reach || layer1Reach) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = Math.max(1, Math.min(scaleX, scaleY) * 0.6);
            ctx.beginPath();
            ctx.arc(dx, dy, radius, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.globalAlpha = splitAlpha;
        } else {
          const layerColor = isDualLayer
            ? (layer0Reach ? DOT_COLOR_UPPER : DOT_COLOR_LOWER)
            : DOT_COLOR_REACHABLE;
          ctx.fillStyle = hasReq ? DOT_COLOR_REQ : layerColor;
          ctx.beginPath();
          ctx.arc(dx, dy, radius, 0, Math.PI * 2);
          ctx.fill();
        }
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

  // Draw hookshot targets
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#00ff88';
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
      ctx.beginPath();
      ctx.arc(dx, dy, dotRadius * 0.65, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
};

export { drawReachableDots };
