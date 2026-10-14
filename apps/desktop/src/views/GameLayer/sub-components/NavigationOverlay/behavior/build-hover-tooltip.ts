/* @layer renderer-components @kind logic */
import type { TooltipData } from '@app/navigation-overlay/tooltip/tooltip.type';
import { buildSpriteInfo } from '@app/navigation-overlay/tile-inspector-tooltip/build-sprite-info';
import { computePathTooltipPosition } from '@app/navigation-overlay/tile-inspector-tooltip/compute-path-tooltip-position';
import { buildTooltipLayers } from '@app/navigation-overlay/tile-inspector-classification';
import { TOOLTIP_OFFSET_X, TOOLTIP_OFFSET_Y } from '../sub-components/TileInspector.constants';
import { activePathTarget } from './active-path-target';
import type { HoverTooltipInput } from './tile-hover.type';

const buildHoverTooltip = (input: HoverTooltipInput): TooltipData => {
  const { geometry, vp, result, sprites, width, height, roomIndex, isIndoors, palaceIndex, equipment, inventoryItems, pathPreviewState } = input;
  const { mx, my, scaleX, scaleY, viewLeft, viewTop, screenWorldX, screenWorldY, tileRow, tileCol } = geometry;

  const bfsBlocked = Boolean(result.dynamicBlockerCells?.some(p => p.row === tileRow && p.col === tileCol));
  const spriteInfo = buildSpriteInfo({ sprites, tileRow, tileCol, screenWorldX, screenWorldY });

  const activeTarget = activePathTarget(pathPreviewState);
  const { tipX, tipY } = activeTarget
    ? computePathTooltipPosition({
        activeTarget, vp, screenWorldX, screenWorldY, viewLeft, viewTop,
        scaleX, scaleY, mx, my, width, height, result,
        lockTarget: Boolean(pathPreviewState?.lockTarget),
      })
    : { tipX: mx + TOOLTIP_OFFSET_X, tipY: my + TOOLTIP_OFFSET_Y };

  const { roomTypeLabel, layers } = buildTooltipLayers({
    result, row: tileRow, col: tileCol, roomIndex, isIndoors, rawPalaceIndexX2: palaceIndex,
    reachableByLayer: result.reachableByLayer, equipment, inventoryItems,
  });

  return {
    x: tipX, y: tipY,
    row: tileRow, col: tileCol, roomTypeLabel, layers,
    pathReqs: result.reqGrid?.[tileRow]?.[tileCol] ?? '',
    bfsBlocked, spriteInfo,
  };
};

export { buildHoverTooltip };
