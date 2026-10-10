/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import type { DrawContext, LockedPathTile, PathPreviewInput } from './draw.type';
import type { GridPos, MouseState } from '../navigation-overlay.type';
import type { PlanePoint } from '../pathfinding/pathfinding.type';
import { findNearest2x2Goal, findPath2x2FromPlayer } from '../pathfinding';
import { PATH_COLOR_OPEN, PATH_COLOR_REQ, PLAYER_FOOT_OFFSET } from './draw.constants';

const goalColor = (goal2x2: GridPos, result: FloodFillResult): string => {
  const targetReq = result.reqGrid?.[goal2x2.row]?.[goal2x2.col] ?? '';
  return targetReq !== '' ? PATH_COLOR_REQ : PATH_COLOR_OPEN;
};

const drawTargetRect = (dc: DrawContext, goal2x2: GridPos, result: FloodFillResult): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, TILE_PX, screenWorldX, screenWorldY } = dc;
  const rectX = (screenWorldX + goal2x2.col * TILE_PX - viewLeft) * scaleX;
  const rectY = (screenWorldY + goal2x2.row * TILE_PX - viewTop) * scaleY;
  ctx.save();
  ctx.globalAlpha = 1.0;
  ctx.strokeStyle = goalColor(goal2x2, result);
  ctx.lineWidth = Math.max(1.5, 2.0 * Math.min(scaleX, scaleY));
  ctx.setLineDash([]);
  ctx.strokeRect(rectX, rectY, TILE_PX * 2 * scaleX, TILE_PX * 2 * scaleY);
  ctx.restore();
};

const traceSmoothPath = (ctx: CanvasRenderingContext2D, points: readonly PlanePoint[]): void => {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return;
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const point = points[i];
    const next = points[i + 1];
    if (!prev || !point || !next) continue;
    ctx.lineTo((prev.x + point.x) / 2, (prev.y + point.y) / 2);
    ctx.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
  }
  ctx.lineTo(last.x, last.y);
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
  traceSmoothPath(ctx, points);
  ctx.stroke();

  ctx.restore();
};

const activeTargetOf = (mouseState: MouseState): GridPos | null => {
  if (mouseState.lockTarget && mouseState.lockedTile) return mouseState.lockedTile;
  return mouseState.leftHeld ? mouseState.hoverTile : null;
};

const lockedPathOf = (path: GridPos[] | null, result: FloodFillResult): LockedPathTile[] | null => {
  const attrGrid = result.attrGrid;
  if (!path || !attrGrid) return null;
  return path.map(p => ({ row: p.row, col: p.col, attr: attrGrid[p.row]?.[p.col] ?? -1 }));
};

const playerPath = (dc: DrawContext, input: PathPreviewInput, goal: GridPos): GridPos[] | null => {
  const { result, vp } = input;
  return findPath2x2FromPlayer({
    player: { x: vp.linkX, y: vp.linkY + PLAYER_FOOT_OFFSET }, screenWorld: { x: dc.screenWorldX, y: dc.screenWorldY }, goal,
    reachable: result.reachable, layerGrids: result.reachableByLayer, startLayer: result.startLayer,
  });
};

const drawPathPreview = (dc: DrawContext, input: PathPreviewInput): void => {
  const { mouseState, result, setLockedPath } = input;

  const activeTarget = activeTargetOf(mouseState);
  if (!activeTarget) return;

  const goal2x2 = findNearest2x2Goal(activeTarget.row, activeTarget.col, result.reachable);
  const path = goal2x2 ? playerPath(dc, input, goal2x2) : null;

  if (mouseState.lockTarget) setLockedPath(lockedPathOf(path, result));
  if (!goal2x2) return;
  drawTargetRect(dc, goal2x2, result);

  if (path && path.length > 1) drawPathLine(dc, path, goalColor(goal2x2, result));
};

export { drawPathPreview };
