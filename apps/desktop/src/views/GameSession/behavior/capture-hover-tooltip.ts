/* @layer renderer-appshell @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { DebugHoverWindow, HoverTile } from './dump-layers.type';
import {
  DEBUG_HOOK_TICK_MS, FLOOD_BUTTON_TIMEOUT_MS, TILE_INSPECTOR_TIMEOUT_MS, TOOLTIP_RENDER_MS,
} from './dump-layers.constants';
import { waitForElement } from './wait-for-element';

const captureHoverTooltip = async (hoverTile: HoverTile, openNavWidget: () => void): Promise<string | null> => {
  openNavWidget();
  console.log('[DumpLayers] Navigation widget opened. Waiting for flood button...');

  const floodBtn = await waitForElement('[data-testid="nav-flood-btn"]', FLOOD_BUTTON_TIMEOUT_MS);
  if (!floodBtn) {
    console.log('[DumpLayers] ERROR: Flood button not found in DOM');
  } else {
    console.log('[DumpLayers] Clicking flood fill button...');
    (floodBtn as HTMLButtonElement).click();
    console.log('[DumpLayers] Waiting for flood fill to complete (TileInspector)...');
  }

  const tileInspector = await waitForElement('[data-testid="tile-inspector"]', TILE_INSPECTOR_TIMEOUT_MS);
  if (!tileInspector) {
    console.log('[DumpLayers] ERROR: TileInspector not found in DOM after 10s');
    return null;
  }

  console.log('[DumpLayers] TileInspector found. Setting tooltip via __debugHoverTile...');
  await new Promise((r) => setTimeout(r, DEBUG_HOOK_TICK_MS));

  const debugFn = (window as DebugHoverWindow).__debugHoverTile;
  if (debugFn) {
    const success = debugFn(hoverTile.col, hoverTile.row);
    console.log(`[DumpLayers] __debugHoverTile(${hoverTile.col}, ${hoverTile.row}) = ${success}`);
  } else {
    console.log('[DumpLayers] WARNING: __debugHoverTile not available');
  }

  await new Promise((r) => setTimeout(r, TOOLTIP_RENDER_MS));

  const hoverScreenshot = await appApi().takeScreenshot(`dump-layers-hover-${hoverTile.col}-${hoverTile.row}`);
  console.log(`[DumpLayers] Hover screenshot: ${hoverScreenshot}`);
  return hoverScreenshot;
};

export { captureHoverTooltip };
