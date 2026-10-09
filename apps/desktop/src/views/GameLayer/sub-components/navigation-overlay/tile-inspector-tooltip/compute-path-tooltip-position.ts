/* @layer renderer-components @kind logic */
import type { GridPos, Rect } from '../navigation-overlay.type';
import { findNearest2x2Goal, findPath2x2FromPlayer } from '../pathfinding';
import { rectsOverlap } from '../pathfinding/rects-overlap';
import { segmentOverlapsRect } from '../pathfinding/segment-overlaps-rect';
import {
  CORNER_MARGIN, EDGE_MARGIN, PATH_CLEARANCE_PX, PLAYER_FOOT_OFFSET, TILE_PX, TOOLTIP_ABOVE_Y, TOOLTIP_BELOW_Y,
  TOOLTIP_HEIGHT, TOOLTIP_OFFSET_X, TOOLTIP_WIDTH,
} from './tile-inspector-tooltip.constants';
import type { PathTipParams, TooltipPosition } from './tile-inspector-tooltip.type';

const pathRequirementsLabel = (path: GridPos[], params: PathTipParams): string => {
  const reqSet = new Set<string>();
  for (const p of path) {
    const reqStr = params.result.reqGrid?.[p.row]?.[p.col] ?? '';
    if (!reqStr) continue;
    for (const reqName of reqStr.split(',')) reqSet.add(reqName);
  }
  const reqText = reqSet.size > 0 ? [...reqSet].sort().join(', ') : 'none';
  return `A* path req: ${reqText}${params.lockTarget ? ' (locked)' : ''}`;
};

const tooltipCandidates = (mx: number, my: number, width: number, height: number): Rect[] => {
  const tipW = TOOLTIP_WIDTH;
  const tipH = TOOLTIP_HEIGHT;
  const clampRect = (r: Rect): Rect => ({
    x: Math.max(EDGE_MARGIN, Math.min(width - r.w - EDGE_MARGIN, r.x)),
    y: Math.max(EDGE_MARGIN, Math.min(height - r.h - EDGE_MARGIN, r.y)),
    w: r.w, h: r.h,
  });
  return [
    { x: mx + TOOLTIP_OFFSET_X, y: my + TOOLTIP_ABOVE_Y, w: tipW, h: tipH },
    { x: mx + TOOLTIP_OFFSET_X, y: my + TOOLTIP_BELOW_Y, w: tipW, h: tipH },
    { x: mx - tipW - TOOLTIP_OFFSET_X, y: my + TOOLTIP_ABOVE_Y, w: tipW, h: tipH },
    { x: mx - tipW - TOOLTIP_OFFSET_X, y: my + TOOLTIP_BELOW_Y, w: tipW, h: tipH },
    { x: CORNER_MARGIN, y: CORNER_MARGIN, w: tipW, h: tipH },
    { x: width - tipW - CORNER_MARGIN, y: CORNER_MARGIN, w: tipW, h: tipH },
    { x: CORNER_MARGIN, y: height - tipH - CORNER_MARGIN, w: tipW, h: tipH },
    { x: width - tipW - CORNER_MARGIN, y: height - tipH - CORNER_MARGIN, w: tipW, h: tipH },
  ].map(clampRect);
};

const computePathTooltipPosition = (params: PathTipParams): TooltipPosition => {
  const { activeTarget, vp, screenWorldX, screenWorldY, viewLeft, viewTop, scaleX, scaleY, mx, my, width, height, result } = params;
  const defaultPosition = { tipX: mx + TOOLTIP_OFFSET_X, tipY: my + TOOLTIP_ABOVE_Y };

  const goal2x2 = findNearest2x2Goal(activeTarget.row, activeTarget.col, result.reachable);
  const path = goal2x2
    ? findPath2x2FromPlayer(
        vp.linkX, vp.linkY + PLAYER_FOOT_OFFSET, screenWorldX, screenWorldY, goal2x2,
        result.reachable, result.reachableByLayer, result.startLayer,
      )
    : null;

  if (!path || path.length <= 1) return defaultPosition;

  const points = path.map((p: GridPos) => ({
    x: (screenWorldX + p.col * TILE_PX + TILE_PX - viewLeft) * scaleX,
    y: (screenWorldY + p.row * TILE_PX + TILE_PX - viewTop) * scaleY,
  }));
  const debugLabel = pathRequirementsLabel(path, params);
  const endPt = points[points.length - 1];
  const pathTextRect: Rect = {
    x: endPt.x + 10, y: endPt.y - 22,
    w: Math.max(120, debugLabel.length * 7), h: 18,
  };

  const overlapsPath = (r: Rect): boolean => {
    for (let i = 1; i < points.length; i++) {
      if (segmentOverlapsRect(points[i - 1], points[i], r, PATH_CLEARANCE_PX)) return true;
    }
    return false;
  };

  const candidates = tooltipCandidates(mx, my, width, height);
  const best = candidates.find(c => !rectsOverlap(c, pathTextRect) && !overlapsPath(c));
  const chosen = best ?? candidates[0];
  return { tipX: chosen.x, tipY: chosen.y };
};

export { computePathTooltipPosition };
