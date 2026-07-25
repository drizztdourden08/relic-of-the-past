/* @layer bridge-wasm @kind logic */
/**
 * The one place FloodFillOptions gets assembled. Five call sites used to build
 * it by hand and no two passed the same set — the engine's own flood omitted
 * entrances, the exit-screen map, blockers AND the start layer, while the
 * offline dumper hard-coded an interior context and an EMPTY inventory. Same
 * core BFS, four different answers.
 *
 * Everything the BFS can use is filled in by default here; a caller that wants
 * less must say so explicitly (see FloodRequest), which makes an omission a
 * visible decision instead of an oversight.
 */
import type { FloodFillOptions } from '@shared/game/navigation/flood-fill/flood-options';
import type { ScreenGridBundle, SimLocation } from '@shared/game/simulation';
import type { GridPos } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import { wasmGetExitScreenMap } from '../';
import { overworldBlockerCells } from './blockers';
import { deriveStartLayer } from './start-layer';

interface FloodRequest {
  location: SimLocation;
  /** Traversal tokens the player holds (lift.N, boots, flippers, hookshot, hammer…). */
  items: TileReq[];
  /** Where the walk starts; omitted means "let the BFS pick a start". */
  startPos?: GridPos;
  /** True when startPos is the player's real position in the loaded screen. */
  atPlayer?: boolean;
  /** Entrances to seed and report. Pass [] to flood geometry only. */
  entrances?: FloodFillOptions['entrances'];
  /** Extra BFS seeds (propagating in from an adjacent screen, ledge landings). */
  extraSeeds?: GridPos[];
  /** Restrict the BFS to a sub-region (a 2×2 room's quadrant). */
  quadrantBounds?: FloodFillOptions['quadrantBounds'];
}

/**
 * Build the full option set for one screen. `grids` must come from
 * getScreenGrids so the blocker stamping and tile context are already correct.
 */
const buildFloodOptions = (req: FloodRequest, grids: ScreenGridBundle): FloodFillOptions => {
  const { location, items, startPos, atPlayer, entrances, extraSeeds, quadrantBounds } = req;
  const indoors = location.isIndoors;
  return {
    tileContext: grids.tileContext,
    inventory: new Set(items),
    ...(startPos ? { startPos } : {}),
    entrances: entrances ?? [],
    exitScreenByRoom: wasmGetExitScreenMap(),
    // Indoor blockers are stamped into the grids themselves (blockers.ts);
    // outdoors they stay dynamic so the overlay can distinguish them.
    ...(indoors ? {} : { dynamicBlockers: overworldBlockerCells(location.owScreenIndex) }),
    ...(grids.variant ? { variant: grids.variant } : {}),
    ...(grids.dualLayerGrids ? { dualLayerGrids: grids.dualLayerGrids } : {}),
    ...(grids.staircaseType !== undefined ? { staircaseType: grids.staircaseType } : {}),
    ...(extraSeeds ? { extraSeeds } : {}),
    ...(quadrantBounds ? { quadrantBounds } : {}),
    ...(() => {
      if (!indoors) return {};
      const layer = deriveStartLayer({ roomId: location.roomId, startPos, dualLayerGrids: grids.dualLayerGrids, atPlayer });
      return layer === undefined ? {} : { startLayer: layer };
    })(),
  };
};

export { buildFloodOptions };
export type { FloodRequest };
