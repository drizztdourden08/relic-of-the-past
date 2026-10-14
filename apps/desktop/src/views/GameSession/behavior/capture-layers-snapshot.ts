/* @layer renderer-appshell @kind logic */
import { wasmGetIndoorDualLayerGrids, wasmGetLinkLayer, wasmGetViewportInfo } from '@app/game';
import type { DumpLayersSnapshot, HoverTile, HoverVerification } from './dump-layers.type';
import { readRoomIndex } from './read-room-index';
import { verifyHoverTile } from './verify-hover-tile';
import { captureHoverTooltip } from './capture-hover-tooltip';

const captureLayersSnapshot = async (
  base: { slot: number; screenshotPath: string; hoverTile: HoverTile | null },
  openNavWidget: () => void,
): Promise<DumpLayersSnapshot> => {
  const { slot, screenshotPath, hoverTile } = base;
  const roomIndex = readRoomIndex();
  const viewport = wasmGetViewportInfo();

  console.log(`[DumpLayers] Room: 0x${roomIndex?.toString(16) ?? '??'}, locationType=${viewport?.locationType}`);
  console.log('[DumpLayers] Gathering dual-layer grid data...');

  const dualLayerGrids = wasmGetIndoorDualLayerGrids();
  const playerLayer = wasmGetLinkLayer();

  let hoverScreenshot: string | null = null;
  let hoverVerification: HoverVerification | null = null;

  if (hoverTile && viewport) {
    console.log(`[DumpLayers] Hover tile requested: [${hoverTile.col}, ${hoverTile.row}]`);
    hoverVerification = verifyHoverTile(dualLayerGrids, hoverTile);
    hoverScreenshot = await captureHoverTooltip(hoverTile, openNavWidget);
  }

  return { slot, roomIndex, viewport, playerLayer, screenshotPath, dualLayerGrids, hoverTile, hoverVerification, hoverScreenshot };
};

export { captureLayersSnapshot };
