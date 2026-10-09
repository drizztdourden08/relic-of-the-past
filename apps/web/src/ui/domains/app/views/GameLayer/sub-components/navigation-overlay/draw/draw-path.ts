/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@shared/game/navigation';
import type { DrawContext, LockedPathTile } from './draw.type';
import type { GridPos, MouseState } from '../navigation-overlay.type';
import { findNearest2x2Goal, findPath2x2FromPlayer } from '../pathfinding';
import { PATH_COLOR_OPEN, PATH_COLOR_REQ, PLAYER_FOOT_OFFSET } from './draw.constants';

const drawTargetRect = (dc: DrawContext, goal2x2: GridPos, result: FloodFillResult): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, TILE_PX, screenWorldX, screenWorldY } = dc;
  const rectX = (screenWorldX + goal2x2.col * TILE_PX - viewLeft) * scaleX;
  const rectY = (screenWorldY + goal2x2.row * TILE_PX - viewTop) * scaleY;
  const targetReq = result.reqGrid?.[goal2x2.row]?.[goal2x2.col] ?? '';
  ctx.save();
  ctx.globalAlpha = 1.0;
  ctx.strokeStyle = targetReq !== '' ? PATH_COLOR_REQ : PATH_COLOR_OPEN;
  ctx.lineWidth = Math.max(1.5, 2.0 * Math.min(scaleX, scaleY));
  ctx.setLineDash([]);
  ctx.strokeRect(rectX, rectY, TILE_PX * 2 * scaleX, TILE_PX * 2 * scaleY);
  ctx.restore();
};

const drawPathLine = (dc: DrawContext, path: GridPos[], lineColor: string): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, TILE_PX, screenWorldX, screenWorldY } = dc;
  const points = path.map((p) => ({
    x: (screenWorldX + p.col * TILE_PX + TILE_PX - viewLeft) * scaleX,
    y: (screenWorldY + p.row * TILE_PX + TILE_PX - viewTop) * scaleY,
  }));

  const dashOffset = -((performance.now() * 0.05) % 13);

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
};

const drawPathPreview = (dc: DrawContext, mouseState: MouseState, result: FloodFillResult, vp: { linkX: number; linkY: number }, setLockedPath: (path: LockedPathTile[] | null) => void): void => {
  const { screenWorldX, screenWorldY } = dc;

  const activeTarget = mouseState.lockTarget && mouseState.lockedTile
    ? mouseState.lockedTile
    : mouseState.leftHeld ? mouseState.hoverTile : null;

  if (!activeTarget) return;

  const goal2x2 = findNearest2x2Goal(activeTarget.row, activeTarget.col, result.reachable);
  const path = goal2x2
    ? findPath2x2FromPlayer(
        vp.linkX, vp.linkY + PLAYER_FOOT_OFFSET, screenWorldX, screenWorldY, goal2x2,
        result.reachable, result.reachableByLayer, result.startLayer,
      )
    : null;

  if (mouseState.lockTarget) {
    const attrGrid = result.attrGrid;
    if (path && attrGrid) {
      setLockedPath(path.map(p => ({ row: p.row, col: p.col, attr: attrGrid[p.row]?.[p.col] ?? -1 })));
    } else {
      setLockedPath(null);
    }
  }

  if (goal2x2) drawTargetRect(dc, goal2x2, result);

  if (path && path.length > 1) {
    const targetReq = goal2x2 ? (result.reqGrid?.[goal2x2.row]?.[goal2x2.col] ?? '') : '';
    drawPathLine(dc, path, targetReq !== '' ? PATH_COLOR_REQ : PATH_COLOR_OPEN);
  }
};

export { drawPathPreview };
