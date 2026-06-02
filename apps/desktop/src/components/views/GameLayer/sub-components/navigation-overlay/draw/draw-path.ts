import type { FloodFillResult } from '@shared/game/navigation';
import type { ReachState } from '@shared/game/navigation/types';
import type { DrawContext } from './draw-context';
import type { MouseState } from '../types';
import { findNearest2x2Goal, findPath2x2FromLink } from '../pathfinding';

export function drawPathPreview(
  dc: DrawContext,
  mouseState: MouseState,
  result: FloodFillResult,
  vp: { linkX: number; linkY: number },
  setLockedPath: (path: { row: number; col: number; attr: number }[] | null) => void,
): void {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, TILE_PX, screenWorldX, screenWorldY } = dc;

  const activeTarget = mouseState.lockTarget && mouseState.lockedTile
    ? mouseState.lockedTile
    : mouseState.leftHeld ? mouseState.hoverTile : null;

  if (!activeTarget) return;

  // Goal-finding uses merged grid (can target either layer)
  const goal2x2 = findNearest2x2Goal(activeTarget.row, activeTarget.col, result.reachable);
  // Pathfinding uses layer-aware routing when dual-layer data exists
  const path = goal2x2
    ? findPath2x2FromLink(
        vp.linkX, vp.linkY + 8, screenWorldX, screenWorldY, goal2x2,
        result.reachable, result.reachableByLayer, result.startLayer,
      )
    : null;

  // Push path to store when locked
  if (mouseState.lockTarget) {
    const attrGrid = result.attrGrid;
    if (path && attrGrid) {
      const pathTiles = path.map(p => ({ row: p.row, col: p.col, attr: attrGrid[p.row]?.[p.col] ?? -1 }));
      setLockedPath(pathTiles);
    } else {
      setLockedPath(null);
    }
  }

  // Draw target 2×2 rectangle
  if (goal2x2) {
    const rectWX = screenWorldX + goal2x2.col * TILE_PX;
    const rectWY = screenWorldY + goal2x2.row * TILE_PX;
    const rectX = (rectWX - viewLeft) * scaleX;
    const rectY = (rectWY - viewTop) * scaleY;
    const rectW = TILE_PX * 2 * scaleX;
    const rectH = TILE_PX * 2 * scaleY;
    const targetReq2 = result.reqGrid?.[goal2x2.row]?.[goal2x2.col] ?? '';
    const targetColor = targetReq2 !== '' ? 'rgba(255, 100, 180, 0.95)' : 'rgba(80, 200, 255, 0.95)';
    ctx.save();
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = targetColor;
    ctx.lineWidth = Math.max(1.5, 2.0 * Math.min(scaleX, scaleY));
    ctx.setLineDash([]);
    ctx.strokeRect(rectX, rectY, rectW, rectH);
    ctx.restore();
  }

  if (path && path.length > 1) {
    const targetReq = goal2x2 ? (result.reqGrid?.[goal2x2.row]?.[goal2x2.col] ?? '') : '';
    const needsItem = targetReq !== '';
    const lineColor = needsItem ? 'rgba(255, 100, 180, 0.95)' : 'rgba(80, 200, 255, 0.95)';

    const points: Array<{ x: number; y: number }> = [];
    for (const p of path) {
      const worldX = screenWorldX + p.col * TILE_PX + TILE_PX;
      const worldY = screenWorldY + p.row * TILE_PX + TILE_PX;
      const sx = (worldX - viewLeft) * scaleX;
      const sy = (worldY - viewTop) * scaleY;
      points.push({ x: sx, y: sy });
    }

    const now = performance.now();
    const dashOffset = -((now * 0.05) % 13);

    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = Math.max(2, 3.5 * Math.min(scaleX, scaleY));
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([8, 5]);
    ctx.lineDashOffset = dashOffset;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const m1x = (points[i - 1].x + points[i].x) / 2;
      const m1y = (points[i - 1].y + points[i].y) / 2;
      const m2x = (points[i].x + points[i + 1].x) / 2;
      const m2y = (points[i].y + points[i + 1].y) / 2;
      ctx.lineTo(m1x, m1y);
      ctx.quadraticCurveTo(points[i].x, points[i].y, m2x, m2y);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();

    ctx.restore();
  }
}
