/* @layer bridge-wasm @kind logic */
/**
 * THE grid source. Every flood — widget, simulator and the offline dumper — gets
 * its collision grids here, so they cannot disagree about what a screen looks
 * like. Grid acquisition varies by LOCATION, not by caller: the room the player
 * currently occupies has live tables (runtime door state, staircase kind, tile
 * context), while any other room is rebuilt addressably from ROM data. Callers
 * used to hard-code one or the other — the widget "live room only", the
 * simulator "always addressable", the dumper both in a fragile order.
 *
 * Blocker footprints are stamped in here, into every layer, so no consumer can
 * forget them (see blockers.ts for why that mattered).
 */
import type { SimLocation, ScreenGridBundle } from '@shared/game/simulation';
import type { TileAttrContext } from '@shared/game/navigation/tile-attrs';
import {
  wasmBuildOverworldAttrGrid,
  wasmBuildRoomAttrGrid,
  wasmBuildRoomDualLayerGrids,
  wasmGetIndoorDualLayerGrids,
  wasmGetIndoorLayer0Grid,
  wasmGetOverworldVariant,
  wasmGetStaircaseType,
  wasmGetViewportInfo,
} from '../';
import { readMapState } from '../simulator/read-game-state';
import { emptyGrid64, toGrid64 } from './grid-convert';
import { stampIndoorBlockers } from './blockers';

/** True when `roomId` is the indoor room the game is standing in right now. */
const isLoadedRoom = (roomId: number): boolean => {
  const live = readMapState();
  return live?.isIndoors === true && live.roomIndex === roomId;
};

const overworldBundle = (owScreenIndex: number): ScreenGridBundle => {
  const flat = wasmBuildOverworldAttrGrid(owScreenIndex);
  const v = wasmGetOverworldVariant(owScreenIndex);
  return {
    screenIndex: owScreenIndex,
    tileContext: 'overworld',
    rawAttrGrid: flat ? toGrid64(flat) : emptyGrid64(),
    ...(v ? { variant: { progressTier: v.progressIndicator, eventOverlay: v.eventOverlayActive, eventFlags: v.screenEventFlags } } : {}),
  };
};

/**
 * The occupied room is READ from the live tables; any other room is rebuilt from ROM.
 *
 * A rebuild derives collision from room data, which throws away exactly the runtime state
 * that makes the answer correct: an opened doorway's transit tiles, the cleared tile
 * under a lifted pot, a pushed block. So the live room must never be rebuilt, however
 * cheap it looks.
 */
const indoorAttrGrid = (roomId: number, live: boolean): number[][] => {
  if (live) return wasmGetIndoorLayer0Grid() ?? emptyGrid64();
  const flat = wasmBuildRoomAttrGrid(roomId);
  return flat ? toGrid64(flat) : emptyGrid64();
};

const indoorBundle = (roomId: number): ScreenGridBundle => {
  // Settled before any read: it picks where every grid below comes from.
  const live = isLoadedRoom(roomId);
  const bundle: ScreenGridBundle = {
    screenIndex: roomId,
    tileContext: 'interior-dungeon',
    rawAttrGrid: indoorAttrGrid(roomId, live),
  };
  if (live) {
    // TileDetect only branches on indoors; cave/house vs dungeon stays split for
    // future tuning, and only the live viewport knows which this room is.
    const vp = wasmGetViewportInfo();
    const ctx: TileAttrContext = vp?.locationType === 2 ? 'interior-dungeon' : 'interior-house';
    bundle.tileContext = ctx;
    const dual = wasmGetIndoorDualLayerGrids();
    if (dual) bundle.dualLayerGrids = { layer0: dual.layer0, layer1: dual.layer1 };
    const staircase = wasmGetStaircaseType();
    if (staircase != null && staircase >= 0) bundle.staircaseType = staircase;
  } else {
    // Remote rooms build BOTH layers addressably — split-level rooms (the castle
    // basements) keep their walkable floor on BG1 and flood as solid otherwise.
    const dual = wasmBuildRoomDualLayerGrids(roomId);
    if (dual) bundle.dualLayerGrids = { layer0: dual.layer0, layer1: dual.layer1 };
  }
  // The dual-layer flood reads the layer grids, not rawAttrGrid — stamp them all.
  const grids = [bundle.rawAttrGrid, ...(bundle.dualLayerGrids ? [bundle.dualLayerGrids.layer0, bundle.dualLayerGrids.layer1] : [])];
  stampIndoorBlockers(roomId, grids, live);
  return bundle;
};

const getScreenGrids = (loc: SimLocation): ScreenGridBundle =>
  loc.isIndoors ? indoorBundle(loc.roomId) : overworldBundle(loc.owScreenIndex);

export { getScreenGrids, isLoadedRoom };
