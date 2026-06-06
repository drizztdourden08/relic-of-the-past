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

export { getLayerDisplayMode, getLockedLayer };
export type { LayerDisplayMode };
