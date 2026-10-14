/* @layer renderer-components @kind logic */
import { resolveRoomContext, roomTypeLabel } from '@rotp/navigation';
import { cellValue } from './cell-value';
import { createLayerDataBuilder } from './create-layer-data-builder';
import { dualTooltipLayers } from './dual-tooltip-layers';
import type { BuildTooltipLayersParams, TooltipLayersBuild } from './tile-inspector-classification.type';

const buildTooltipLayers = (params: BuildTooltipLayersParams): TooltipLayersBuild => {
  const { result, row, col, isIndoors, rawPalaceIndexX2 } = params;

  const room = resolveRoomContext(isIndoors, rawPalaceIndexX2);
  const toLayerData = createLayerDataBuilder(params, room);

  const mergedAttr = cellValue(result.attrGrid, row, col);
  const mergedReach = cellValue(result.reachable, row, col);
  const layers = dualTooltipLayers(params, toLayerData)
    ?? { mode: 'single' as const, primary: toLayerData(mergedAttr, 0, mergedReach, false) };

  return { roomTypeLabel: roomTypeLabel(room), layers };
};

export { buildTooltipLayers };
