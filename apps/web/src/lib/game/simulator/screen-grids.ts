/* @layer bridge-wasm @kind logic */
/**
 * Assembles a ScreenGridBundle for any location via the existing grid sources —
 * the overworld/room attr-grid builders (room-addressable, headless) plus the
 * live dual-layer + staircase reads, which only reflect the room Link currently
 * occupies and so are attached only for that room. Indoor grids get the uncle's
 * blocker footprint stamped in (live position for the loaded room, static spawn
 * for remote rooms), so EVERY consumer — the engine's reachability flood and the
 * per-screen detect flood alike — sees the same sealed corridor until his check.
 */
import type { SimLocation, ScreenGridBundle } from '@shared/game/simulation';
import type { TileAttrContext } from '@shared/game/navigation/tile-attrs';
import {
  wasmBuildOverworldAttrGrid,
  wasmBuildRoomAttrGrid,
  wasmBuildRoomDualLayerGrids,
  wasmGetIndoorDualLayerGrids,
  wasmGetIndoorUncleBlockers,
  wasmGetRoomSpriteSpawns,
  wasmGetStaircaseType,
  wasmGetViewportInfo,
} from '../';
import { getCompletedChecks } from '../tracker';
import { readMapState } from './read-game-state';

const toGrid64 = (flat: Uint8Array): number[][] => {
  const grid: number[][] = [];
  for (let r = 0; r < 64; r++) {
    const row = new Array<number>(64);
    for (let c = 0; c < 64; c++) row[c] = flat[r * 64 + c];
    grid.push(row);
  }
  return grid;
};

const empty64 = (): number[][] => Array.from({ length: 64 }, () => new Array<number>(64).fill(0));

const overworldBundle = (owScreenIndex: number): ScreenGridBundle => {
  const flat = wasmBuildOverworldAttrGrid(owScreenIndex);
  return {
    screenIndex: owScreenIndex,
    tileContext: 'overworld',
    rawAttrGrid: flat ? toGrid64(flat) : empty64(),
  };
};

const stamp3x3 = (grid: number[][], r0: number, c0: number): void => {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const rr = r0 + dr;
      const cc = c0 + dc;
      if (rr >= 0 && rr < 64 && cc >= 0 && cc < 64) grid[rr][cc] = 0x01;
    }
  }
};

/**
 * Early-game uncle footprint (sprite 0x73): he physically blocks the corridor
 * in the house/passage until his check is collected. The loaded room uses his
 * LIVE position; a remote room stamps his static spawn from the sprite table.
 */
const stampUncleBlockers = (roomId: number, grids: number[][][]): void => {
  if (getCompletedChecks().has("Link's Uncle")) return;
  const live = readMapState();
  const vp = wasmGetViewportInfo();
  if (live?.isIndoors && live.roomIndex === roomId && vp) {
    const originX = Math.floor(vp.linkX / 512) * 512;
    const originY = Math.floor(vp.linkY / 512) * 512;
    for (const b of wasmGetIndoorUncleBlockers()) {
      for (const g of grids) stamp3x3(g, Math.floor((b.y - originY) / 8), Math.floor((b.x - originX) / 8));
    }
    return;
  }
  for (const s of wasmGetRoomSpriteSpawns(roomId)) {
    if (s.spriteType === 0x73) for (const g of grids) stamp3x3(g, s.row, s.col);
  }
};

const indoorBundle = (roomId: number): ScreenGridBundle => {
  const flat = wasmBuildRoomAttrGrid(roomId);
  const bundle: ScreenGridBundle = {
    screenIndex: roomId,
    tileContext: 'interior-dungeon',
    rawAttrGrid: flat ? toGrid64(flat) : empty64(),
  };
  // Live reads (runtime door state, staircase, context) for the loaded room;
  // remote rooms build BOTH layers addressably — split-level rooms (castle
  // basements) keep their walkable floor on BG1 and flood as solid otherwise.
  const map = readMapState();
  if (map?.isIndoors && map.roomIndex === roomId) {
    const vp = wasmGetViewportInfo();
    const ctx: TileAttrContext = vp?.locationType === 2 ? 'interior-dungeon' : 'interior-house';
    bundle.tileContext = ctx;
    const dual = wasmGetIndoorDualLayerGrids();
    if (dual) bundle.dualLayerGrids = { layer0: dual.layer0, layer1: dual.layer1 };
    const staircase = wasmGetStaircaseType();
    if (staircase != null && staircase >= 0) bundle.staircaseType = staircase;
  } else {
    const dual = wasmBuildRoomDualLayerGrids(roomId);
    if (dual) bundle.dualLayerGrids = { layer0: dual.layer0, layer1: dual.layer1 };
  }
  // The dual-layer flood reads the layer grids, not rawAttrGrid — stamp them all.
  const grids = [bundle.rawAttrGrid, ...(bundle.dualLayerGrids ? [bundle.dualLayerGrids.layer0, bundle.dualLayerGrids.layer1] : [])];
  stampUncleBlockers(roomId, grids);
  return bundle;
};

const getScreenGrids = (loc: SimLocation): ScreenGridBundle =>
  loc.isIndoors ? indoorBundle(loc.roomId) : overworldBundle(loc.owScreenIndex);

export { getScreenGrids };
