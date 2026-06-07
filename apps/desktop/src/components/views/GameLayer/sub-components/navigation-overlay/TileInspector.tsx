/* @layer renderer-components @kind component */
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useGameUIStore } from '../../../../../stores/game-ui-store';
import { wasmGetViewportInfo, wasmGetLiveSprites } from '../../../../../lib/game';
import { classifyTileAttr } from '@shared/game/navigation/tile-classification';
import { getTileAttrsMap, getAttrLabel } from '@shared/game/navigation/tile-attrs';
import type { FloodFillResult } from '@shared/game/navigation';
import type { ReachState } from '@shared/game/navigation/types';
import type { GridPos, Rect, MouseState } from './types';
import { rectsOverlap, segmentOverlapsRect } from './pathfinding/helpers';
import { findNearest2x2Goal, findPath2x2FromLink } from './pathfinding/astar-2x2';
import { TileTooltipContent, type TooltipData } from './tooltip';

interface TileInspectorProps {
  width: number;
  height: number;
  result: FloodFillResult;
  overworldScreenIndex: number;
  roomIndex: number;
  isIndoors: boolean;
  onHoverTile?: (row: number, col: number) => void;
  pathPreviewState?: MouseState;
}

const TileInspector = ({ width, height, result, overworldScreenIndex, roomIndex: _roomIndex, isIndoors, onHoverTile, pathPreviewState }: TileInspectorProps) => {
  const equipment = useGameUIStore(s => s.equipment);
  const inventoryItems = useGameUIStore(s => s.inventory.items);
  const spriteRef = useRef<ReturnType<typeof wasmGetLiveSprites>>([]);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const vpRef = useRef<ReturnType<typeof wasmGetViewportInfo>>(null);

  const [rectSel, setRectSel] = useState<{
    startRow: number; startCol: number;
    endRow: number; endCol: number;
    active: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const layer0ReachableLocal = useMemo(() => {
    if (!result.reachableByLayer) return undefined;
    return Array.from({ length: 64 }, (_, r) =>
      Array.from({ length: 64 }, (_, c) => result.reachableByLayer![0][r][c] !== 0),
    );
  }, [result.reachableByLayer]);
  const layer1ReachableLocal = useMemo(() => {
    if (!result.reachableByLayer) return undefined;
    return Array.from({ length: 64 }, (_, r) =>
      Array.from({ length: 64 }, (_, c) => result.reachableByLayer![1][r][c] !== 0),
    );
  }, [result.reachableByLayer]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      vpRef.current = wasmGetViewportInfo();
      spriteRef.current = wasmGetLiveSprites();
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    (window as any).__debugHoverTile = (col: number, row: number) => {
      const vp = vpRef.current;
      if (!vp || !result.attrGrid) return false;
      if (row < 0 || row >= 64 || col < 0 || col >= 64) return false;
      const attr = result.attrGrid[row][col];
      const reachable = result.reachable[row][col];
      const context = result.tileContext ?? 'overworld';
      const label = getAttrLabel(attr, context);
      const classification = classifyTileAttr(attr, context);
      const tileDef = getTileAttrsMap(context)[attr];
      setTooltip({
        x: width / 2, y: 40, row, col, attr, label,
        type: classification.type === 'ledge' ? `ledge (${classification.dir})` : classification.type,
        req: tileDef?.req ?? null, canPass: null, reachable,
        hookTarget: tileDef?.hookTarget ?? false,
        pathReqs: result.reqGrid?.[row]?.[col] ?? '',
        bfsBlocked: false, spriteInfo: [],
        layer0Attr: result.dualLayerGrids?.layer0[row]?.[col],
        layer1Attr: result.dualLayerGrids?.layer1[row]?.[col],
        layer0Reach: layer0ReachableLocal?.[row]?.[col],
        layer1Reach: layer1ReachableLocal?.[row]?.[col],
      });
      return true;
    };
    return () => { delete (window as any).__debugHoverTile; };
  }, [result, width, height, layer0ReachableLocal, layer1ReachableLocal]);

  const mouseToTile = useCallback((e: React.MouseEvent<HTMLDivElement>): GridPos | null => {
    const vp = vpRef.current;
    if (!vp || !result.attrGrid) return null;
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const snesW = vp.snesWidth;
    const snesH = vp.snesHeight;
    const scaleX = width / snesW;
    const scaleY = height / snesH;
    const snesX = mx / scaleX;
    const snesY = my / scaleY;
    const viewLeft = vp.cameraX - vp.extraLeftRight;
    const viewTop = vp.cameraY;
    const worldX = snesX + viewLeft;
    const worldY = snesY + viewTop;
    const screenWorldX = isIndoors
      ? (Math.floor(vp.linkX / 512) * 512)
      : ((result.screenIndex & 7) * 512);
    const screenWorldY = isIndoors
      ? (Math.floor(vp.linkY / 512) * 512)
      : (((result.screenIndex >> 3) & 7) * 512);
    const col = Math.floor((worldX - screenWorldX) / 8);
    const row = Math.floor((worldY - screenWorldY) / 8);
    if (row < 0 || row >= 64 || col < 0 || col >= 64) return null;
    return { row, col };
  }, [width, height, result, isIndoors]);

  const handleRectMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!e.shiftKey || e.button !== 0) return;
    const tile = mouseToTile(e);
    if (!tile) return;
    e.preventDefault();
    e.stopPropagation();
    setRectSel({ startRow: tile.row, startCol: tile.col, endRow: tile.row, endCol: tile.col, active: true });
    setCopied(false);
  }, [mouseToTile]);

  const handleRectMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!rectSel?.active) return;
    const tile = mouseToTile(e);
    if (!tile) return;
    setRectSel(s => s ? { ...s, endRow: tile.row, endCol: tile.col } : s);
  }, [rectSel?.active, mouseToTile]);

  const handleRectMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!rectSel?.active || e.button !== 0) return;
    const tile = mouseToTile(e);
    if (tile) {
      setRectSel(s => s ? { ...s, endRow: tile.row, endCol: tile.col, active: false } : s);
    } else {
      setRectSel(s => s ? { ...s, active: false } : s);
    }

    const sel = rectSel;
    const endRow = tile?.row ?? sel.endRow;
    const endCol = tile?.col ?? sel.endCol;
    const r0 = Math.min(sel.startRow, endRow);
    const r1 = Math.max(sel.startRow, endRow);
    const c0 = Math.min(sel.startCol, endCol);
    const c1 = Math.max(sel.startCol, endCol);

    if (!result.attrGrid) return;

    const context = result.tileContext ?? 'overworld';
    const rows: string[] = [];
    for (let r = r0; r <= r1; r++) {
      const cells: string[] = [];
      for (let c = c0; c <= c1; c++) {
        const attr = result.attrGrid[r][c];
        const reach = result.reachable[r][c];
        const ch = reach === 0 ? '-' : reach === 1 ? '+' : '~';
        cells.push(`${attr.toString(16).padStart(2, '0')}${ch}`);
      }
      rows.push(cells.join(' '));
    }

    const header = [
      `Tile Selection [${r0},${c0}] to [${r1},${c1}] (${(r1 - r0 + 1)}×${(c1 - c0 + 1)} = ${(r1 - r0 + 1) * (c1 - c0 + 1)} tiles)`,
      `Context: ${context} | Screen: 0x${result.screenIndex.toString(16).padStart(2, '0')}`,
      `Format: <hex_attr><+reachable|~traversal|-blocked>`,
      ``,
    ];

    const text = header.join('\n') + rows.join('\n');
    navigator.clipboard.writeText(text).then(() => setCopied(true));
  }, [rectSel, result, mouseToTile]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rectSel?.active) {
      handleRectMouseMove(e);
      return;
    }

    const vp = vpRef.current;
    if (!vp || !result.attrGrid) {
      setTooltip(null);
      if (onHoverTile) onHoverTile(-1, -1);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const snesW = vp.snesWidth;
    const snesH = vp.snesHeight;
    const scaleX = width / snesW;
    const scaleY = height / snesH;
    const snesX = mx / scaleX;
    const snesY = my / scaleY;
    const viewLeft = vp.cameraX - vp.extraLeftRight;
    const viewTop = vp.cameraY;
    const worldX = snesX + viewLeft;
    const worldY = snesY + viewTop;
    const screenWorldX = isIndoors
      ? (Math.floor(vp.linkX / 512) * 512)
      : ((result.screenIndex & 7) * 512);
    const screenWorldY = isIndoors
      ? (Math.floor(vp.linkY / 512) * 512)
      : (((result.screenIndex >> 3) & 7) * 512);

    const tileCol = Math.floor((worldX - screenWorldX) / 8);
    const tileRow = Math.floor((worldY - screenWorldY) / 8);

    if (tileRow < 0 || tileRow >= 64 || tileCol < 0 || tileCol >= 64) {
      setTooltip(null);
      if (onHoverTile) onHoverTile(-1, -1);
      return;
    }

    const attr = result.attrGrid[tileRow][tileCol];
    const reachable = result.reachable[tileRow][tileCol];
    const context = result.tileContext ?? 'overworld';
    const classification = classifyTileAttr(attr, context);
    const label = getAttrLabel(attr, context);
    const tileDef = getTileAttrsMap(context)[attr];
    const req = tileDef?.req ?? null;
    const hookTarget = tileDef?.hookTarget ?? false;
    const bfsBlocked = !!result.dynamicBlockerCells?.some(p => p.row === tileRow && p.col === tileCol);

    const spriteInfo = spriteRef.current
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

    let tipX = mx + 14;
    let tipY = my - 60;

    const activeTarget = pathPreviewState
      ? (pathPreviewState.lockTarget && pathPreviewState.lockedTile
        ? pathPreviewState.lockedTile
        : pathPreviewState.leftHeld ? pathPreviewState.hoverTile : null)
      : null;

    if (activeTarget) {
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
        const debugLabel = `A* path req: ${reqText}${pathPreviewState?.lockTarget ? ' (locked)' : ''}`;

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
    }

    setTooltip({
      x: tipX, y: tipY,
      row: tileRow, col: tileCol,
      attr, label,
      type: classification.type === 'ledge' ? `ledge (${classification.dir})` : classification.type,
      req, canPass, reachable, hookTarget,
      pathReqs: result.reqGrid?.[tileRow]?.[tileCol] ?? '',
      bfsBlocked, spriteInfo,
      layer0Attr: result.dualLayerGrids?.layer0[tileRow]?.[tileCol],
      layer1Attr: result.dualLayerGrids?.layer1[tileRow]?.[tileCol],
      layer0Reach: layer0ReachableLocal?.[tileRow]?.[tileCol],
      layer1Reach: layer1ReachableLocal?.[tileRow]?.[tileCol],
    });
    if (onHoverTile) onHoverTile(tileRow, tileCol);
  }, [width, height, result, overworldScreenIndex, equipment.gloves, equipment.boots, equipment.flippers, inventoryItems, onHoverTile, pathPreviewState, rectSel?.active, handleRectMouseMove, layer0ReachableLocal, layer1ReachableLocal]);

  const selectionRect = (() => {
    if (!rectSel) return null;
    const vp = vpRef.current;
    if (!vp) return null;
    const scaleX = width / vp.snesWidth;
    const scaleY = height / vp.snesHeight;
    const viewLeft = vp.cameraX - vp.extraLeftRight;
    const viewTop = vp.cameraY;
    const screenWorldX = isIndoors
      ? (Math.floor(vp.linkX / 512) * 512)
      : ((result.screenIndex & 7) * 512);
    const screenWorldY = isIndoors
      ? (Math.floor(vp.linkY / 512) * 512)
      : (((result.screenIndex >> 3) & 7) * 512);
    const r0 = Math.min(rectSel.startRow, rectSel.endRow);
    const r1 = Math.max(rectSel.startRow, rectSel.endRow);
    const c0 = Math.min(rectSel.startCol, rectSel.endCol);
    const c1 = Math.max(rectSel.startCol, rectSel.endCol);
    const x = (screenWorldX + c0 * 8 - viewLeft) * scaleX;
    const y = (screenWorldY + r0 * 8 - viewTop) * scaleY;
    const w = (c1 - c0 + 1) * 8 * scaleX;
    const h = (r1 - r0 + 1) * 8 * scaleY;
    return { x, y, w, h, tileCount: (r1 - r0 + 1) * (c1 - c0 + 1) };
  })();

  return (
    <div
      data-testid="tile-inspector"
      onMouseMove={handleMouseMove}
      onMouseDown={handleRectMouseDown}
      onMouseUp={handleRectMouseUp}
      onMouseLeave={() => { setTooltip(null); if (onHoverTile) onHoverTile(-1, -1); }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width, height,
        zIndex: 6,
        cursor: rectSel?.active ? 'crosshair' : undefined,
      }}
    >
      {selectionRect && (
        <div style={{
          position: 'absolute',
          left: selectionRect.x, top: selectionRect.y,
          width: selectionRect.w, height: selectionRect.h,
          border: '2px solid #ffee00',
          background: 'rgba(255, 238, 0, 0.12)',
          pointerEvents: 'none', zIndex: 7,
        }} />
      )}
      {copied && rectSel && !rectSel.active && (
        <div style={{
          position: 'absolute', left: '50%', top: 8,
          transform: 'translateX(-50%)',
          background: 'rgba(20,180,60,0.92)', color: '#fff',
          padding: '4px 12px', borderRadius: 4,
          fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold',
          pointerEvents: 'none', zIndex: 8,
        }}>
          Tile data copied to clipboard! ({selectionRect?.tileCount} tiles)
        </div>
      )}
      {tooltip && !rectSel?.active && <TileTooltipContent tooltip={tooltip} result={result} />}
    </div>
  );
};

export { TileInspector };
