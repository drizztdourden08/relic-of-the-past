/* @layer renderer-components @kind component */
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type React from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { useGameUIStore } from '../../../../stores/game-ui-store';
import { wasmGetViewportInfo, wasmGetLiveSprites } from '../../../../game';
import { TileTooltipContent, type TooltipData } from './tooltip';
import { mouseEventToTile } from './tile-inspector-coords';
import { useRectSelection } from './behavior/useRectSelection';
import { buildSpriteInfo } from './tile-inspector-tooltip/build-sprite-info';
import { computePathTooltipPosition } from './tile-inspector-tooltip/compute-path-tooltip-position';
import { buildTooltipLayers } from './tile-inspector-classification';
import { viewOrigin } from '@rotp/game-core';
import {
  COPIED_TOAST, DEBUG_TOOLTIP_TOP, SCREEN_GRID_MASK, SCREEN_PX, SCREEN_TILES, TILE_PX, TOOLTIP_OFFSET_X, TOOLTIP_OFFSET_Y,
} from './TileInspector.constants';
import type { DebugHoverWindow, TileInspectorProps } from './TileInspector.type';

const outsideScreen = (row: number, col: number): boolean => row < 0 || row >= SCREEN_TILES || col < 0 || col >= SCREEN_TILES;

const TileInspector = ({ width, height, result, overworldScreenIndex, roomIndex, isIndoors, onHoverTile, pathPreviewState }: TileInspectorProps) => {
  const equipment = useGameUIStore(s => s.equipment);
  const inventoryItems = useGameUIStore(s => s.inventory.items);
  const palaceIndex = useGameUIStore(s => s.map.palaceIndex);
  const spriteRef = useRef<ReturnType<typeof wasmGetLiveSprites>>([]);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const vpRef = useRef<ReturnType<typeof wasmGetViewportInfo>>(null);

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
    const debugWindow = window as DebugHoverWindow;
    debugWindow.__debugHoverTile = (col: number, row: number) => {
      const vp = vpRef.current;
      if (!vp || !result.attrGrid) return false;
      if (outsideScreen(row, col)) return false;

      const { roomTypeLabel, layers } = buildTooltipLayers({
        result, row, col, roomIndex, isIndoors, rawPalaceIndexX2: palaceIndex,
        reachableByLayer: result.reachableByLayer, equipment, inventoryItems,
      });
      setTooltip({
        x: width / 2, y: DEBUG_TOOLTIP_TOP, row, col, roomTypeLabel, layers,
        pathReqs: result.reqGrid?.[row]?.[col] ?? '',
        bfsBlocked: false, spriteInfo: [],
      });
      return true;
    };
    return () => { delete debugWindow.__debugHoverTile; };
  }, [result, width, height, roomIndex, isIndoors, palaceIndex, equipment, inventoryItems]);

  const mouseToTile = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => mouseEventToTile(e, vpRef.current, result, width, height, isIndoors),
    [width, height, result, isIndoors],
  );

  const { rectSel, copied, handleRectMouseDown, handleRectMouseMove, handleRectMouseUp, selectionRect } = useRectSelection({
    mouseToTile, result, width, height, isIndoors, vpRef,
  });

  const clearHover = useCallback(() => {
    setTooltip(null);
    if (onHoverTile) onHoverTile(-1, -1);
  }, [onHoverTile]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rectSel?.active) {
      handleRectMouseMove(e);
      return;
    }

    const vp = vpRef.current;
    if (!vp || !result.attrGrid) {
      clearHover();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const scaleX = width / vp.snesWidth;
    const scaleY = height / vp.snesHeight;
    const { viewLeft, viewTop } = viewOrigin(vp);
    const worldX = mx / scaleX + viewLeft;
    const worldY = my / scaleY + viewTop;
    const screenWorldX = isIndoors ? (Math.floor(vp.linkX / SCREEN_PX) * SCREEN_PX) : ((result.screenIndex & SCREEN_GRID_MASK) * SCREEN_PX);
    const screenWorldY = isIndoors ? (Math.floor(vp.linkY / SCREEN_PX) * SCREEN_PX) : (((result.screenIndex >> 3) & SCREEN_GRID_MASK) * SCREEN_PX);

    const tileCol = Math.floor((worldX - screenWorldX) / TILE_PX);
    const tileRow = Math.floor((worldY - screenWorldY) / TILE_PX);

    if (outsideScreen(tileRow, tileCol)) {
      clearHover();
      return;
    }

    const bfsBlocked = !!result.dynamicBlockerCells?.some(p => p.row === tileRow && p.col === tileCol);
    const spriteInfo = buildSpriteInfo(spriteRef.current, tileRow, tileCol, screenWorldX, screenWorldY);

    const activeTarget = pathPreviewState
      ? (pathPreviewState.lockTarget && pathPreviewState.lockedTile
        ? pathPreviewState.lockedTile
        : pathPreviewState.leftHeld ? pathPreviewState.hoverTile : null)
      : null;

    const { tipX, tipY } = activeTarget
      ? computePathTooltipPosition({
          activeTarget, vp, screenWorldX, screenWorldY, viewLeft, viewTop,
          scaleX, scaleY, mx, my, width, height, result,
          lockTarget: !!pathPreviewState?.lockTarget,
        })
      : { tipX: mx + TOOLTIP_OFFSET_X, tipY: my + TOOLTIP_OFFSET_Y };

    const { roomTypeLabel, layers } = buildTooltipLayers({
      result, row: tileRow, col: tileCol, roomIndex, isIndoors, rawPalaceIndexX2: palaceIndex,
      reachableByLayer: result.reachableByLayer, equipment, inventoryItems,
    });

    setTooltip({
      x: tipX, y: tipY,
      row: tileRow, col: tileCol, roomTypeLabel, layers,
      pathReqs: result.reqGrid?.[tileRow]?.[tileCol] ?? '',
      bfsBlocked, spriteInfo,
    });
    if (onHoverTile) onHoverTile(tileRow, tileCol);
  }, [width, height, result, overworldScreenIndex, roomIndex, isIndoors, palaceIndex, equipment, inventoryItems, onHoverTile, pathPreviewState, rectSel?.active, handleRectMouseMove, clearHover]);

  const selecting = !!rectSel?.active;
  const inspectorStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width, height,
    zIndex: 6,
    cursor: selecting ? 'crosshair' : undefined,
  }), [width, height, selecting]);
  const selectionStyle = useMemo(() => (selectionRect ? {
    position: 'absolute' as const,
    left: selectionRect.x, top: selectionRect.y,
    width: selectionRect.w, height: selectionRect.h,
    border: '2px solid var(--c-primary)',
    background: 'var(--c-primary-soft)',
    pointerEvents: 'none' as const, zIndex: 7,
  } : undefined), [selectionRect]);

  return (
    <Box
      data-testid="tile-inspector"
      onMouseMove={handleMouseMove}
      onMouseDown={handleRectMouseDown}
      onMouseUp={handleRectMouseUp}
      onMouseLeave={clearHover}
      style={inspectorStyle}
    >
      {selectionRect && <Box style={selectionStyle} />}
      {copied && rectSel && !rectSel.active && (
        <Box style={COPIED_TOAST}>
          Tile data copied to clipboard! ({selectionRect?.tileCount} tiles)
        </Box>
      )}
      {tooltip && !rectSel?.active && <TileTooltipContent tooltip={tooltip} />}
    </Box>
  );
};

export { TileInspector };
