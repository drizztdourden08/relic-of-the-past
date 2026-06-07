/* @layer renderer-components @kind logic */
/** Pure tooltip-data helpers for TileInspector (can-pass, sprite list, path-aware placement). */
import type { FloodFillResult } from '@shared/game/navigation';
import type { wasmGetViewportInfo, wasmGetLiveSprites } from '../../../../../lib/game';
import type { GridPos, Rect } from './types';
import { findNearest2x2Goal, findPath2x2FromLink } from './pathfinding/astar-2x2';
import { rectsOverlap, segmentOverlapsRect } from './pathfinding/helpers';

type Sprites = ReturnType<typeof wasmGetLiveSprites>;

interface PathTipParams {
  activeTarget: GridPos;
  vp: NonNullable<ReturnType<typeof wasmGetViewportInfo>>;
  screenWorldX: number;
  screenWorldY: number;
  viewLeft: number;
  viewTop: number;
  scaleX: number;
  scaleY: number;
  mx: number;
  my: number;
  width: number;
  height: number;
  result: FloodFillResult;
  lockTarget: boolean;
}

const computeCanPass = (
  req: string | null,
  equipment: { gloves: number; boots: unknown; flippers: unknown },
  inventoryItems: ArrayLike<number>,
): boolean | null => {
  let canPass: boolean | null = null;
  if (req) {
    switch (req) {
      case 'lift.1': canPass = true; break;
      case 'lift.2': canPass = equipment.gloves >= 1; break;
      case 'lift.3': canPass = equipment.gloves >= 2; break;
      case 'hammer': canPass = inventoryItems[11] >= 1; break;
      case 'boots': canPass = !!equipment.boots; break;
      case 'flippers': canPass = !!equipment.flippers; break;
    }
  }
  return canPass;
};

const buildSpriteInfo = (sprites: Sprites, tileRow: number, tileCol: number, screenWorldX: number, screenWorldY: number): string[] =>
  sprites
    .map(s => {
      const c0 = Math.floor((s.x - screenWorldX) / 8);
      const r0 = Math.floor((s.y - screenWorldY) / 8);
      const dr = Math.max(0, Math.abs(tileRow - r0) - 1);
      const dc2 = Math.max(0, Math.abs(tileCol - c0) - 1);
      const dist = dr + dc2;
      return { s, r0, c0, dist };
    })
    .filter(x => x.r0 >= -1 && x.r0 < 65 && x.c0 >= -1 && x.c0 < 65 && x.dist === 0)
    .sort((a, b) => a.s.slot - b.s.slot)
    .map(({ s, r0, c0, dist }) => {
      const hex2 = (v: number) => v.toString(16).padStart(2, '0');
      const near = dist === 0 ? 'on' : `d${dist}`;
      return `#${s.slot} type 0x${hex2(s.type)} st 0x${hex2(s.state)} sub ${s.subtype}/${s.subtype2} e${s.e} @${c0},${r0} ${near}`;
    });

const computePathTooltipPosition = (params: PathTipParams): { tipX: number; tipY: number } => {
  const { activeTarget, vp, screenWorldX, screenWorldY, viewLeft, viewTop, scaleX, scaleY, mx, my, width, height, result, lockTarget } = params;
  let tipX = mx + 14;
  let tipY = my - 60;

  // Goal-finding uses merged grid (can target either layer)
  const goal2x2 = findNearest2x2Goal(activeTarget.row, activeTarget.col, result.reachable);
  // Pathfinding uses layer-aware routing when dual-layer data exists
  const path = goal2x2
    ? findPath2x2FromLink(
        vp.linkX, vp.linkY + 8, screenWorldX, screenWorldY, goal2x2,
        result.reachable, result.reachableByLayer, result.startLayer,
      )
    : null;

  if (path && path.length > 1) {
    const points = path.map((p: GridPos) => ({
      x: (screenWorldX + p.col * 8 + 8 - viewLeft) * scaleX,
      y: (screenWorldY + p.row * 8 + 8 - viewTop) * scaleY,
    }));

    const reqSet = new Set<string>();
    for (const p of path) {
      const reqStr = result.reqGrid?.[p.row]?.[p.col] ?? '';
      if (!reqStr) continue;
      for (const reqName of reqStr.split(',')) reqSet.add(reqName);
    }
    const reqText = reqSet.size > 0 ? [...reqSet].sort().join(', ') : 'none';
    const debugLabel = `A* path req: ${reqText}${lockTarget ? ' (locked)' : ''}`;

    const endPt = points[points.length - 1];
    const pathTextRect: Rect = {
      x: endPt.x + 10, y: endPt.y - 22,
      w: Math.max(120, debugLabel.length * 7), h: 18,
    };

    const tipW = 320;
    const tipH = 58;
    const clampRect = (r: Rect): Rect => ({
      x: Math.max(4, Math.min(width - r.w - 4, r.x)),
      y: Math.max(4, Math.min(height - r.h - 4, r.y)),
      w: r.w, h: r.h,
    });

    const candidates: Rect[] = [
      { x: mx + 14, y: my - 60, w: tipW, h: tipH },
      { x: mx + 14, y: my + 18, w: tipW, h: tipH },
      { x: mx - tipW - 14, y: my - 60, w: tipW, h: tipH },
      { x: mx - tipW - 14, y: my + 18, w: tipW, h: tipH },
      { x: 6, y: 6, w: tipW, h: tipH },
      { x: width - tipW - 6, y: 6, w: tipW, h: tipH },
      { x: 6, y: height - tipH - 6, w: tipW, h: tipH },
      { x: width - tipW - 6, y: height - tipH - 6, w: tipW, h: tipH },
    ].map(clampRect);

    const overlapsPath = (r: Rect): boolean => {
      for (let i = 1; i < points.length; i++) {
        if (segmentOverlapsRect(points[i - 1], points[i], r, 7)) return true;
      }
      return false;
    };

    const best = candidates.find(c => !rectsOverlap(c, pathTextRect) && !overlapsPath(c));
    const chosen = best ?? candidates[0];
    tipX = chosen.x;
    tipY = chosen.y;
  }

  return { tipX, tipY };
};

export { computeCanPass, buildSpriteInfo, computePathTooltipPosition };
