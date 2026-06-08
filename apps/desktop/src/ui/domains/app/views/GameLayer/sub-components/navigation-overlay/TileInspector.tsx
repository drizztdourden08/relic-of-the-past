/* @layer renderer-components @kind component */
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Box } from '../../../../../../design-system/primitives/Box';
import { useGameUIStore } from '../../../../../../../stores/game-ui-store';
import { wasmGetViewportInfo, wasmGetLiveSprites } from '../../../../../../../lib/game';
import { classifyTileAttr } from '@shared/game/navigation/tile-classification';
import { getTileAttrsMap, getAttrLabel } from '@shared/game/navigation/tile-attrs';
import type { FloodFillResult } from '@shared/game/navigation';
import type { ReachState } from '@shared/game/navigation/types';
import type { MouseState } from './navigation-overlay.type';
import { TileTooltipContent, type TooltipData } from './tooltip';
import { mouseEventToTile } from './tile-inspector-coords';
import { useRectSelection } from './tile-inspector-rect-selection';
import { computeCanPass, buildSpriteInfo, computePathTooltipPosition } from './tile-inspector-tooltip';

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
    const viewLeft = vp.cameraX - vp.extraLeftRight;
    const viewTop = vp.cameraY;
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

    const attr = result.attrGrid[tileRow][tileCol];
    const reachable = result.reachable[tileRow][tileCol];
    const context = result.tileContext ?? 'overworld';
    const classification = classifyTileAttr(attr, context);
    const label = getAttrLabel(attr, context);
    const tileDef = getTileAttrsMap(context)[attr];
    const req = tileDef?.req ?? null;
    const hookTarget = tileDef?.hookTarget ?? false;
    const bfsBlocked = !!result.dynamicBlockerCells?.some(p => p.row === tileRow && p.col === tileCol);

    const spriteInfo = buildSpriteInfo(spriteRef.current, tileRow, tileCol, screenWorldX, screenWorldY);
    const canPass = computeCanPass(req, equipment, inventoryItems);

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
  }, [width, height, result, overworldScreenIndex, equipment, inventoryItems, onHoverTile, pathPreviewState, rectSel?.active, handleRectMouseMove, layer0ReachableLocal, layer1ReachableLocal]);

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
          border: '2px solid #ffee00',
          background: 'rgba(255, 238, 0, 0.12)',
          pointerEvents: 'none', zIndex: 7,
        }} />
      )}
      {copied && rectSel && !rectSel.active && (
        <Box style={{
          position: 'absolute', left: '50%', top: 8,
          transform: 'translateX(-50%)',
          background: 'rgba(20,180,60,0.92)', color: '#fff',
          padding: '4px 12px', borderRadius: 4,
          fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold',
          pointerEvents: 'none', zIndex: 8,
        }}>
          Tile data copied to clipboard! ({selectionRect?.tileCount} tiles)
        </Box>
      )}
      {tooltip && !rectSel?.active && <TileTooltipContent tooltip={tooltip} result={result} />}
    </Box>
  );
};

export { TileInspector };
