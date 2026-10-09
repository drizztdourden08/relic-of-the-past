/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@shared/game/navigation';
import type { LayerReach } from '../tooltip.type';

const getSingleLayer = (result: FloodFillResult, reach: LayerReach): 0 | 1 => {
  if (result.dualLayerGrids) {
    if (reach.layer0Reach && !reach.layer1Reach) return 0;
    if (reach.layer1Reach && !reach.layer0Reach) return 1;
  }
  const outdoorGroundLayer = 1;
  if (!result.indoors) return outdoorGroundLayer;
  return result.startLayer ?? 0;
};

export { getSingleLayer };
