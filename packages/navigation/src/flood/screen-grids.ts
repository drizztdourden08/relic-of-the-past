/* @layer bridge-wasm @kind logic */
import type { SimLocation, ScreenGridBundle } from '../simulation';
import { wasmBuildOverworldAttrGrid, wasmBuildRoomAttrGrid, wasmBuildRoomDualLayerGrids, wasmGetIndoorDualLayerGrids, wasmGetIndoorLayer0Grid, wasmGetOverworldVariant, wasmGetStaircaseType } from '@rotp/game-core';
import { emptyGrid64 } from './empty-grid64';
import { toGrid64 } from './to-grid64';
import { isLoadedRoom } from './is-loaded-room';
import { stampIndoorBlockers } from './blockers';
import { stampBombedWalls } from './bombed-walls';

const overworldBundle = (owScreenIndex: number): ScreenGridBundle => {
  const flat = wasmBuildOverworldAttrGrid(owScreenIndex);
  const v = wasmGetOverworldVariant(owScreenIndex);
  return {
    screenIndex: owScreenIndex,
    indoors: false,
    rawAttrGrid: flat ? toGrid64(flat) : emptyGrid64(),
    ...(v ? { variant: { progressTier: v.progressIndicator, eventOverlay: v.eventOverlayActive, eventFlags: v.screenEventFlags } } : {}),
  };
};

const indoorAttrGrid = (roomId: number, live: boolean): number[][] => {
  if (live) return wasmGetIndoorLayer0Grid() ?? emptyGrid64();
  const flat = wasmBuildRoomAttrGrid(roomId);
  return flat ? toGrid64(flat) : emptyGrid64();
};

const attachLiveLayers = (bundle: ScreenGridBundle): void => {
  const dual = wasmGetIndoorDualLayerGrids();
  if (dual) bundle.dualLayerGrids = { layer0: dual.layer0, layer1: dual.layer1 };
  const staircase = wasmGetStaircaseType();
  if (staircase != null && staircase >= 0) bundle.staircaseType = staircase;
};

const attachRebuiltLayers = (bundle: ScreenGridBundle, roomId: number): void => {
  const dual = wasmBuildRoomDualLayerGrids(roomId);
  if (dual) bundle.dualLayerGrids = { layer0: dual.layer0, layer1: dual.layer1 };
};

const indoorBundle = (roomId: number): ScreenGridBundle => {
  const live = isLoadedRoom(roomId);
  const bundle: ScreenGridBundle = {
    screenIndex: roomId,
    indoors: true,
    rawAttrGrid: indoorAttrGrid(roomId, live),
  };
  if (live) attachLiveLayers(bundle);
  else attachRebuiltLayers(bundle, roomId);
  const everyFloodedLayer = [bundle.rawAttrGrid, ...(bundle.dualLayerGrids ? [bundle.dualLayerGrids.layer0, bundle.dualLayerGrids.layer1] : [])];
  stampIndoorBlockers(roomId, everyFloodedLayer, live);
  stampBombedWalls(roomId, everyFloodedLayer);
  return bundle;
};

const getScreenGrids = (loc: SimLocation): ScreenGridBundle =>
  loc.isIndoors ? indoorBundle(loc.roomId) : overworldBundle(loc.owScreenIndex);

export { getScreenGrids };
