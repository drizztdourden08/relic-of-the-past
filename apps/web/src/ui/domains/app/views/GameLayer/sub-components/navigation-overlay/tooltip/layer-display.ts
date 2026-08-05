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
 * The layer a ONE-COLUMN tooltip is describing.
 *
 * The reader needs this on every tile, not only where both layers happen to
 * carry content: "free and reachable" means something different on a walkway
 * than on the floor beneath it, and without the label a single-column tooltip
 * silently drops the distinction. A tile reached on exactly one layer is
 * described by that layer; anything else falls back to the layer the room
 * itself starts on, which is also the only sensible answer for a surface with
 * no second layer at all.
 */
const getSingleLayer = (
  result: FloodFillResult,
  reach: { layer0Reach?: boolean; layer1Reach?: boolean },
): 0 | 1 => {
  if (result.dualLayerGrids) {
    if (reach.layer0Reach && !reach.layer1Reach) return 0;
    if (reach.layer1Reach && !reach.layer0Reach) return 1;
  }
  // Outdoors there is one surface and it is the ground, whatever the walk's
  // internal start layer happens to be numbered.
  if ((result.tileContext ?? 'overworld') === 'overworld') return 1;
  return result.startLayer ?? 0;
};

/** Heading for a layer column: ▲ for the upper floor, ▼ for the ground. */
const layerHeading = (layer: 0 | 1): string => (layer === 0 ? '▲ ABOVE' : '▼ GROUND');

export { getLayerDisplayMode, getLockedLayer, getSingleLayer, layerHeading };
export type { LayerDisplayMode };
