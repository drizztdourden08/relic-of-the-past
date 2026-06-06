import type { FloodFillResult } from '@shared/game/navigation';

type LayerDisplayMode = 'single' | 'dual' | 'locked';

/**
 * Determine how to display layer info in the tooltip:
 * - 'single': overworld or room without dual-layer grids
 * - 'dual': dual-layer room with free layer transitions
 * - 'locked': dual-layer room but staircaseType===2 (only active layer matters)
 */
function getLayerDisplayMode(result: FloodFillResult): LayerDisplayMode {
  if (!result.dualLayerGrids) return 'single';
  if (result.staircaseType === 2) return 'locked';
  return 'dual';
}

/**
 * For 'locked' mode, return which layer is the active one.
 * 0 = upper/BG2 (ABOVE), 1 = lower/BG1 (GROUND).
 */
function getLockedLayer(result: FloodFillResult): 0 | 1 {
  return result.startLayer ?? 0;
}

export { getLayerDisplayMode, getLockedLayer };
export type { LayerDisplayMode };
