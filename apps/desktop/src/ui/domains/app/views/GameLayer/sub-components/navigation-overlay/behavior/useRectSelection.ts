/* @layer renderer-components @kind hook */
import type React from 'react';
import { useState, useCallback } from 'react';
import { screenOriginFor } from '@app/lib/game/flood';
import { viewOrigin } from '@rotp/game-core';
import { tileBlockText } from './tile-block-text';
import { TILE_PX } from '../pathfinding/pathfinding.constants';
import type { RectSelection, RectSelectionParams } from './useRectSelection.type';

const useRectSelection = (params: RectSelectionParams) => {
  const { mouseToTile, result, width, height, isIndoors, vpRef } = params;

  const [rectSel, setRectSel] = useState<RectSelection | null>(null);
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

    const text = tileBlockText(result, result.attrGrid, r0, r1, c0, c1);
    navigator.clipboard.writeText(text).then(() => setCopied(true));
  }, [rectSel, result, mouseToTile]);

  const selectionRect = (() => {
    if (!rectSel) return null;
    const vp = vpRef.current;
    if (!vp) return null;
    const scaleX = width / vp.snesWidth;
    const scaleY = height / vp.snesHeight;
    const { viewLeft, viewTop } = viewOrigin(vp);
    const { x: screenWorldX, y: screenWorldY } = screenOriginFor({
      isIndoors, linkX: vp.linkX, linkY: vp.linkY, screenIndex: result.screenIndex,
    });
    const r0 = Math.min(rectSel.startRow, rectSel.endRow);
    const r1 = Math.max(rectSel.startRow, rectSel.endRow);
    const c0 = Math.min(rectSel.startCol, rectSel.endCol);
    const c1 = Math.max(rectSel.startCol, rectSel.endCol);
    const x = (screenWorldX + c0 * TILE_PX - viewLeft) * scaleX;
    const y = (screenWorldY + r0 * TILE_PX - viewTop) * scaleY;
    const w = (c1 - c0 + 1) * TILE_PX * scaleX;
    const h = (r1 - r0 + 1) * TILE_PX * scaleY;
    return { x, y, w, h, tileCount: (r1 - r0 + 1) * (c1 - c0 + 1) };
  })();

  return { rectSel, copied, handleRectMouseDown, handleRectMouseMove, handleRectMouseUp, selectionRect };
};

export { useRectSelection };
