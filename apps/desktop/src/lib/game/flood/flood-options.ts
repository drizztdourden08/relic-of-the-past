/* @layer bridge-wasm @kind logic */
import type { FloodFillOptions } from '@shared/game/navigation/flood-fill/flood-options';
import type { ScreenGridBundle } from '@shared/game/simulation';
import { wasmGetExitScreenMap } from '../';
import { overworldBlockerCells } from './blockers';
import { deriveStartLayer } from './start-layer';
import type { FloodRequest } from './flood-options.type';

const startLayerOption = (req: FloodRequest, grids: ScreenGridBundle): { startLayer?: 0 | 1 } => {
  const { location, startPos, atPlayer } = req;
  if (!location.isIndoors) return {};
  const layer = deriveStartLayer({ roomId: location.roomId, startPos, dualLayerGrids: grids.dualLayerGrids, atPlayer });
  return layer === undefined ? {} : { startLayer: layer };
};

const buildFloodOptions = (req: FloodRequest, grids: ScreenGridBundle): FloodFillOptions => {
  const { location, items, startPos, entrances, extraSeeds, quadrantBounds } = req;
  const indoors = location.isIndoors;
  return {
    indoors: grids.indoors,
    inventory: new Set(items),
    ...(startPos ? { startPos } : {}),
    entrances: entrances ?? [],
    exitScreenByRoom: wasmGetExitScreenMap(),
    ...(indoors ? {} : { dynamicBlockers: overworldBlockerCells(location.owScreenIndex) }),
    ...(grids.variant ? { variant: grids.variant } : {}),
    ...(grids.dualLayerGrids ? { dualLayerGrids: grids.dualLayerGrids } : {}),
    ...(grids.staircaseType !== undefined ? { staircaseType: grids.staircaseType } : {}),
    ...(extraSeeds ? { extraSeeds } : {}),
    ...(quadrantBounds ? { quadrantBounds } : {}),
    ...startLayerOption(req, grids),
  };
};

export { buildFloodOptions };
export type { FloodRequest } from './flood-options.type';
