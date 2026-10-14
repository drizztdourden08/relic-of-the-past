/* @layer renderer-components @kind hook */
import { useEffect } from 'react';
import { useGameUIStore } from '../../../../../stores/game-ui-store';
import { buildTooltipLayers } from '@app/navigation-overlay/tile-inspector-classification';
import { outsideScreen } from './outside-screen';
import { DEBUG_TOOLTIP_TOP } from '../sub-components/TileInspector.constants';
import type { DebugHoverWindow } from '../sub-components/TileInspector.type';
import type { DebugHoverParams } from './useDebugHoverTile.type';

const useDebugHoverTile = (params: DebugHoverParams): void => {
  const { result, width, roomIndex, isIndoors, palaceIndex, vpRef, setTooltip } = params;
  const equipment = useGameUIStore(s => s.equipment);
  const inventoryItems = useGameUIStore(s => s.inventory.items);

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
  }, [result, width, roomIndex, isIndoors, palaceIndex, equipment, inventoryItems]);
};

export { useDebugHoverTile };
