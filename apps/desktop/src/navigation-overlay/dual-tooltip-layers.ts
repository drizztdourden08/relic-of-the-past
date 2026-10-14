/* @layer renderer-components @kind logic */
import type { ReachState } from '@rotp/game-core';
import { getLayerDisplayMode } from './layer-display/get-layer-display-mode';
import { getLockedLayer } from './layer-display/get-locked-layer';
import { cellValue } from './cell-value';
import type { LayerDataBuilder } from './layer-data-builder.type';
import type { BuildTooltipLayersParams } from './tile-inspector-classification.type';
import type { TooltipLayers } from './tooltip/tooltip.type';

const hasOwnContent = (attr: number, reach: ReachState): boolean => attr !== 0x00 || reach !== 0;

const dualTooltipLayers = (params: BuildTooltipLayersParams, toLayerData: LayerDataBuilder): TooltipLayers | null => {
  const { result, row, col, reachableByLayer } = params;
  if (!result.dualLayerGrids) return null;

  const a0 = cellValue(result.dualLayerGrids.layer0, row, col);
  const a1 = cellValue(result.dualLayerGrids.layer1, row, col);
  const r0 = cellValue(reachableByLayer?.[0], row, col);
  const r1 = cellValue(reachableByLayer?.[1], row, col);

  if (getLayerDisplayMode(result) === 'locked') {
    const lockedLayer = getLockedLayer(result);
    const attr = lockedLayer === 0 ? a0 : a1;
    const reach = lockedLayer === 0 ? r0 : r1;
    return { mode: 'locked', lockedLayer, primary: toLayerData(attr, lockedLayer, reach, lockedLayer === 0) };
  }

  if (!hasOwnContent(a0, r0) || !hasOwnContent(a1, r1)) return null;

  return {
    mode: 'dual',
    above: toLayerData(a0, 0, r0, true),
    ground: toLayerData(a1, 1, r1, false),
  };
};

export { dualTooltipLayers };
