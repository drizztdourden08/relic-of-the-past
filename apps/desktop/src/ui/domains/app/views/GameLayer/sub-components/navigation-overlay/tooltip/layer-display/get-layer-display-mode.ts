/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import { LAYER_CHANGE_BLOCKED_STAIRCASE } from './layer-display.constants';
import type { LayerDisplayMode } from '../tooltip.type';

const getLayerDisplayMode = (result: FloodFillResult): LayerDisplayMode => {
  if (!result.dualLayerGrids) return 'single';
  if (result.staircaseType === LAYER_CHANGE_BLOCKED_STAIRCASE) return 'locked';
  return 'dual';
};

export { getLayerDisplayMode };
