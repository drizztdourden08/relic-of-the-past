/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@shared/game/navigation';

type LayerDisplayMode = 'single' | 'dual' | 'locked';

const getLayerDisplayMode = (result: FloodFillResult): LayerDisplayMode => {
  if (!result.dualLayerGrids) return 'single';
  if (result.staircaseType === 2) return 'locked';
  return 'dual';
};

const getLockedLayer = (result: FloodFillResult): 0 | 1 => {
  return result.startLayer ?? 0;
};

/**
 * The layer a ONE-COLUMN tooltip describes. A tile reached on exactly one layer is described by
 * that layer; anything else falls back to the layer the room starts on.
 */
const getSingleLayer = (
  result: FloodFillResult,
  reach: { layer0Reach?: boolean; layer1Reach?: boolean },
): 0 | 1 => {
  if (result.dualLayerGrids) {
    if (reach.layer0Reach && !reach.layer1Reach) return 0;
    if (reach.layer1Reach && !reach.layer0Reach) return 1;
  }
  // Outdoors the one surface is the ground, whatever the walk's start layer is numbered.
  if (!result.indoors) return 1;
  return result.startLayer ?? 0;
};

/** Heading for a layer column: ▲ for the upper floor, ▼ for the ground. */
const layerHeading = (layer: 0 | 1): string => (layer === 0 ? '▲ ABOVE' : '▼ GROUND');

export { getLayerDisplayMode, getLockedLayer, getSingleLayer, layerHeading };
export type { LayerDisplayMode };
