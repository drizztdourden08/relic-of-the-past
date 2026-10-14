/* @layer renderer-appshell @kind logic */
import type { DumpLayersSnapshot } from './dump-layers.type';
import { findSplitTiles } from './find-split-tiles';

const buildDumpLayersOutput = (snapshot: DumpLayersSnapshot) => {
  const { slot, roomIndex, viewport, playerLayer, screenshotPath, dualLayerGrids, hoverTile, hoverVerification, hoverScreenshot } = snapshot;
  return {
    timestamp: new Date().toISOString(),
    stateSlot: slot,
    roomIndex,
    roomHex: roomIndex !== null ? `0x${roomIndex.toString(16).padStart(3, '0')}` : null,
    linkLayer: playerLayer,
    viewport: viewport ? {
      mainModule: viewport.mainModule,
      locationType: viewport.locationType,
      linkX: viewport.linkX,
      linkY: viewport.linkY,
      cameraX: viewport.cameraX,
      cameraY: viewport.cameraY,
    } : null,
    screenshotPath,
    hasDualLayers: dualLayerGrids !== null,
    grids: dualLayerGrids ? {
      layer0: dualLayerGrids.layer0,
      layer1: dualLayerGrids.layer1,
      splitTiles: findSplitTiles(dualLayerGrids),
    } : null,
    hoverTile: hoverTile ? {
      ...hoverTile,
      verification: hoverVerification,
      screenshot: hoverScreenshot,
    } : undefined,
  };
};

export { buildDumpLayersOutput };
