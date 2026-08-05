/* @layer renderer-components @kind component */
import { useRef, useEffect, useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { Box } from '@ds/primitives/Box';
import { useGameUIStore } from '../../../../../../../stores/game-ui-store';
import { wasmGetViewportInfo, wasmGetLiveSprites } from '../../../../../../../lib/game';
import type { FloodFillResult } from '@shared/game/navigation';
import type { MouseState } from './navigation-overlay.type';
import { TileTooltipContent, type TooltipData } from './tooltip';
import { mouseEventToTile } from './tile-inspector-coords';
import { useRectSelection } from './tile-inspector-rect-selection';
import { buildSpriteInfo, computePathTooltipPosition } from './tile-inspector-tooltip';
import { buildTooltipLayers } from './tile-inspector-classification';

const COPIED_TOAST: CSSProperties = { position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)', background: 'var(--c-green)', color: 'var(--c-text)', padding: '4px 12px', borderRadius: 'var(--r-sm)', fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold', pointerEvents: 'none', zIndex: 8 };

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
    (window as any).__debugHoverTile = (col: number, row: number) => {
      const vp = vpRef.current;
      if (!vp || !result.attrGrid) return false;
      if (row < 0 || row >= 64 || col < 0 || col >= 64) return false;

      const { roomTypeLabel, layers } = buildTooltipLayers({
        result, row, col, roomIndex, isIndoors, rawPalaceIndexX2: palaceIndex,
        reachableByLayer: result.reachableByLayer, equipment, inventoryItems,
      });
      setTooltip({
        x: width / 2, y: 40, row, col, roomTypeLabel, layers,
        pathReqs: result.reqGrid?.[row]?.[col] ?? '',
        bfsBlocked: false, spriteInfo: [],
      });
      return true;
    };
    return () => { delete (window as any).__debugHoverTile; };
  }, [result, width, height, roomIndex, isIndoors, palaceIndex, equipment, inventoryItems]);

  const mouseToTile = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => mouseEventToTile(e, vpRef.current, result, width, height, isIndoors),
    [width, height, result, isIndoors],
  );

  const { rectSel, copied, handleRectMouseDown, handleRectMouseMove, handleRectMouseUp, selectionRect } = useRectSelection({
    mouseToTile, result, width, height, isIndoors, vpRef,
  });

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
    const viewLeft = vp.cameraX - vp.cameraLockShiftX - vp.extraLeftRight;
    const viewTop = vp.cameraY - vp.cameraLockShiftY;
    const worldX = snesX + viewLeft;
    const worldY = snesY + viewTop;
    const screenWorldX = isIndoors ? (Math.floor(vp.linkX / 512) * 512) : ((result.screenIndex & 7) * 512);
    const screenWorldY = isIndoors ? (Math.floor(vp.linkY / 512) * 512) : (((result.screenIndex >> 3) & 7) * 512);

    const tileCol = Math.floor((worldX - screenWorldX) / 8);
    const tileRow = Math.floor((worldY - screenWorldY) / 8);

    if (tileRow < 0 || tileRow >= 64 || tileCol < 0 || tileCol >= 64) {
      setTooltip(null);
      if (onHoverTile) onHoverTile(-1, -1);
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
      : { tipX: mx + 14, tipY: my - 60 };

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
  }, [width, height, result, overworldScreenIndex, roomIndex, isIndoors, palaceIndex, equipment, inventoryItems, onHoverTile, pathPreviewState, rectSel?.active, handleRectMouseMove]);

  return (
    <Box
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
        <Box style={{
          position: 'absolute',
          left: selectionRect.x, top: selectionRect.y,
          width: selectionRect.w, height: selectionRect.h,
          border: '2px solid var(--c-gold)',
          background: 'var(--c-gold-soft)',
          pointerEvents: 'none', zIndex: 7,
        }} />
      )}
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
