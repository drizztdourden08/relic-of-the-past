/* @layer renderer-components @kind hook */
/** Shift-drag rectangle selection + clipboard export of a tile-attr block. */
import type React from 'react';
import { useState, useCallback } from 'react';
import type { FloodFillResult } from '@shared/game/navigation';
import type { wasmGetViewportInfo } from '../../../../../../../lib/game';
import type { GridPos } from './types';

interface RectSelectionParams {
  mouseToTile: (e: React.MouseEvent<HTMLDivElement>) => GridPos | null;
  result: FloodFillResult;
  width: number;
  height: number;
  isIndoors: boolean;
  vpRef: React.MutableRefObject<ReturnType<typeof wasmGetViewportInfo>>;
}

const useRectSelection = (params: RectSelectionParams) => {
  const { mouseToTile, result, width, height, isIndoors, vpRef } = params;

  const [rectSel, setRectSel] = useState<{
    startRow: number; startCol: number;
    endRow: number; endCol: number;
    active: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

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

  return { rectSel, copied, handleRectMouseDown, handleRectMouseMove, handleRectMouseUp, selectionRect };
};

export { useRectSelection };
