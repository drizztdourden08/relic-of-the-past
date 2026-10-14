/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import type React from 'react';
import { useGameUIStore } from '../../../../../stores/game-ui-store';
import type { TooltipData } from '@app/navigation-overlay/tooltip/tooltip.type';
import { buildHoverTooltip } from './build-hover-tooltip';
import { hoverGeometry } from './hover-geometry';
import { outsideScreen } from './outside-screen';
import type { TileHoverParams } from './tile-hover.type';

const useTileHover = (params: TileHoverParams) => {
  const { width, height, result, roomIndex, isIndoors, palaceIndex, pathPreviewState, onHoverTile, rectActive, handleRectMouseMove, vpRef, spriteRef } = params;
  const equipment = useGameUIStore(s => s.equipment);
  const inventoryItems = useGameUIStore(s => s.inventory.items);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const clearHover = useCallback(() => {
    setTooltip(null);
    if (onHoverTile) onHoverTile(-1, -1);
  }, [onHoverTile]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rectActive) {
      handleRectMouseMove(e);
      return;
    }

    const vp = vpRef.current;
    if (!vp || !result.attrGrid) {
      clearHover();
      return;
    }

    const geometry = hoverGeometry({ event: e, vp, result, width, height, isIndoors });
    if (outsideScreen(geometry.tileRow, geometry.tileCol)) {
      clearHover();
      return;
    }

    setTooltip(buildHoverTooltip({
      geometry, vp, result, sprites: spriteRef.current, width, height, roomIndex, isIndoors, palaceIndex,
      equipment, inventoryItems, pathPreviewState,
    }));
    if (onHoverTile) onHoverTile(geometry.tileRow, geometry.tileCol);
  }, [width, height, result, roomIndex, isIndoors, palaceIndex, equipment, inventoryItems, onHoverTile, pathPreviewState, rectActive, handleRectMouseMove, clearHover, vpRef, spriteRef]);

  return { tooltip, setTooltip, clearHover, handleMouseMove };
};

export { useTileHover };
