/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import type { ReachState } from '@rotp/game-core';
import { GRID_SIZE, STAIRS_TRAVERSAL_STATE } from '@rotp/navigation';
import { DRAW_DOTS_LEDGE_ATTRS } from '@rotp/game-data';
import type { DrawContext } from './draw.type';
import {
  DOT_COLOR_REACHABLE, DOT_COLOR_REQ, RING_COLOR_ABOVE, RING_COLOR_BOTH, RING_COLOR_GROUND,
} from './draw.constants';

const isLedgeState = (s: number): boolean => s >= 2 && s <= 9;

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

const drawHookTargets = (dc: DrawContext, drawResults: FloodFillResult[]): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, snesW, snesH, TILE_PX, dotRadius, getScreenWorldOrigin } = dc;
  ctx.globalAlpha = 0.7;
  for (const drawResult of drawResults) {
    if (!drawResult.hookTargets || drawResult.hookTargets.length === 0) continue;
    const origin = getScreenWorldOrigin(drawResult.screenIndex);
    for (const ht of drawResult.hookTargets) {
      const screenX = origin.x + ht.col * TILE_PX + TILE_PX / 2 - viewLeft;
      const screenY = origin.y + ht.row * TILE_PX + TILE_PX / 2 - viewTop;
      if (screenX < -TILE_PX || screenX > snesW + TILE_PX) continue;
      if (screenY < -TILE_PX || screenY > snesH + TILE_PX) continue;

      const hasReq = drawResult.reqGrid && drawResult.reqGrid[ht.row]?.[ht.col] !== '';
      ctx.fillStyle = hasReq ? DOT_COLOR_REQ : DOT_COLOR_REACHABLE;
      ctx.beginPath();
      ctx.arc(screenX * scaleX, screenY * scaleY, dotRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

const drawReachableDots = (dc: DrawContext, drawResults: FloodFillResult[], layer1ReachableOverride: [ReachState[][], ReachState[][]] | null): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, snesW, snesH, TILE_PX, dotRadius, getScreenWorldOrigin } = dc;

  ctx.globalAlpha = 0.55;
  for (const drawResult of drawResults) {
    const origin = getScreenWorldOrigin(drawResult.screenIndex);
    const perLayer = layer1ReachableOverride;
    const isDualLayer = !!perLayer;
    const singleLayerIsAbove = !isDualLayer && drawResult.indoors && (drawResult.startLayer ?? 0) === 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const layer0Reach = perLayer ? perLayer[0][r][c] !== 0 : false;
        const layer1Reach = perLayer ? perLayer[1][r][c] !== 0 : false;
        const mergedReachable = perLayer ? (layer0Reach || layer1Reach) : drawResult.reachable[r][c] === 1;
        if (!mergedReachable) continue;

        const reachedOnBothLayers = isDualLayer && layer0Reach && layer1Reach;
        const standingLayerAttr = isDualLayer && !layer0Reach
          ? drawResult.dualLayerGrids?.layer1?.[r]?.[c]
          : drawResult.attrGrid?.[r]?.[c];
        if (!reachedOnBothLayers && standingLayerAttr !== undefined && DRAW_DOTS_LEDGE_ATTRS.has(standingLayerAttr)) continue;
        if (perLayer && (perLayer[0][r][c] === STAIRS_TRAVERSAL_STATE || perLayer[1][r][c] === STAIRS_TRAVERSAL_STATE)) continue;
        if (perLayer && (isLedgeState(perLayer[0][r][c]) || isLedgeState(perLayer[1][r][c]))) continue;

        const screenX = origin.x + c * TILE_PX + TILE_PX / 2 - viewLeft;
        const screenY = origin.y + r * TILE_PX + TILE_PX / 2 - viewTop;
        if (screenX < -TILE_PX || screenX > snesW + TILE_PX) continue;
        if (screenY < -TILE_PX || screenY > snesH + TILE_PX) continue;

        const dx = screenX * scaleX;
        const dy = screenY * scaleY;
        const hasReq = drawResult.reqGrid && drawResult.reqGrid[r][c] !== '';
        const radius = dotRadius * 0.6;

        ctx.fillStyle = hasReq ? DOT_COLOR_REQ : DOT_COLOR_REACHABLE;
        ctx.beginPath();
        ctx.arc(dx, dy, radius, 0, Math.PI * 2);
        ctx.fill();

        const ringColor = reachedOnBothLayers
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

  drawFloodStart(dc, drawResults[0]);
  drawHookTargets(dc, drawResults);
};

export { drawReachableDots };
