/* @layer bridge-wasm @kind logic */
/**
 * Assembles a ScreenGridBundle for any location via the existing grid sources —
 * the overworld/room attr-grid builders (room-addressable, headless) plus the
 * live dual-layer + staircase reads, which only reflect the room Link currently
 * occupies and so are attached only for that room.
 */
import type { SimLocation, ScreenGridBundle } from '@shared/game/simulation';
import type { TileAttrContext } from '@shared/game/navigation/tile-attrs';
import {
  wasmBuildOverworldAttrGrid,
  wasmBuildRoomAttrGrid,
  wasmGetIndoorDualLayerGrids,
  wasmGetStaircaseType,
  wasmGetViewportInfo,
} from '../';
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

const indoorBundle = (roomId: number): ScreenGridBundle => {
  const flat = wasmBuildRoomAttrGrid(roomId);
  const bundle: ScreenGridBundle = {
    screenIndex: roomId,
    tileContext: 'interior-dungeon',
    rawAttrGrid: flat ? toGrid64(flat) : empty64(),
  };

  // Dual-layer + staircase state are live reads of the loaded room only.
  const map = readMapState();
  if (map?.isIndoors && map.roomIndex === roomId) {
    const vp = wasmGetViewportInfo();
    const ctx: TileAttrContext = vp?.locationType === 2 ? 'interior-dungeon' : 'interior-house';
    bundle.tileContext = ctx;
    const dual = wasmGetIndoorDualLayerGrids();
    if (dual) bundle.dualLayerGrids = { layer0: dual.layer0, layer1: dual.layer1 };
    const staircase = wasmGetStaircaseType();
    if (staircase != null && staircase >= 0) bundle.staircaseType = staircase;
  }
  return bundle;
};

const getScreenGrids = (loc: SimLocation): ScreenGridBundle =>
  loc.isIndoors ? indoorBundle(loc.roomId) : overworldBundle(loc.owScreenIndex);

export { getScreenGrids };
