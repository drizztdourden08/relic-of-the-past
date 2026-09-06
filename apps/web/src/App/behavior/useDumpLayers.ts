/* @layer renderer-appshell @kind hook */
/**
 * Debug hook: reacts to --dump-layers=N [--hover-tile=col,row] CLI flags. Runs
 * the whole pass itself and exits, dumping the room index and dual-layer grids
 * (the same data the overlay uses) as JSON. --hover-tile also drives a mousemove
 * over the target tile so the screenshot captures the tooltip.
 *
 * Usage:
 *   npx electron dist/electron/main.js --muted --dump-layers=6
 *   npx electron dist/electron/main.js --muted --dump-layers=6 --hover-tile=45,31
 */

import { useEffect, useRef } from 'react';
import { subscribeGameState, loadState, wasmGetIndoorDualLayerGrids, wasmGetLinkLayer, wasmGetViewportInfo, wasmGetGameUIState } from '../../lib/game';
import { waitForElement, findSplitTiles, isLayer1Reachable } from './dump-layers/dump-layers-helpers';

interface DumpLayersDeps {
  activeProfile: Profile | null;
  loadProfileForGame: (profile: Profile) => Promise<void>;
  openNavWidget: () => void;
}

const useDumpLayers = ({ activeProfile, loadProfileForGame, openNavWidget }: DumpLayersDeps) => {
  const didRun = useRef(false);

  useEffect(() => {
    if (!activeProfile || didRun.current) return;

    let cancelled = false;

    (async () => {
      const slot = await window.api.getDumpLayersSlot();
      const hoverTile = await window.api.getHoverTile();
      console.log(`[DumpLayers] hook fired. slot=${slot}, hoverTile=${JSON.stringify(hoverTile)}, profile=${activeProfile.name}`);
      if (slot === null) return;

      didRun.current = true;

      console.log(`[DumpLayers] Starting game for profile: ${activeProfile.name}`);
      await loadProfileForGame(activeProfile);

      // Wait for game to reach 'running'
      await new Promise<void>((resolve) => {
        const unsub = subscribeGameState((state) => {
          if (cancelled) { unsub(); return; }
          if (state.status === 'running') {
            unsub();
            resolve();
          }
        });
      });
      if (cancelled) return;

      console.log(`[DumpLayers] Game running. Loading state slot ${slot}...`);
      await loadState(slot);

      // Wait for state to apply and a few frames to render
      await new Promise((r) => setTimeout(r, 2000));
      if (cancelled) return;

      // Take initial screenshot
      console.log('[DumpLayers] Taking screenshot...');
      const screenshotPath = await window.api.takeScreenshot(`dump-layers-state${slot}`);
      console.log(`[DumpLayers] Screenshot: ${screenshotPath}`);

      // Get room index from UI state buffer (roomIndex at offset 77, uint16 LE)
      const uiState = wasmGetGameUIState();
      let roomIndex: number | null = null;
      if (uiState) {
        const { heap, ptr } = uiState;
        roomIndex = heap[ptr + 77] | (heap[ptr + 78] << 8);
      }

      // Get viewport info
      const viewport = wasmGetViewportInfo();

      console.log(`[DumpLayers] Room: 0x${roomIndex?.toString(16) ?? '??'}, locationType=${viewport?.locationType}`);
      console.log('[DumpLayers] Gathering dual-layer grid data...');

      const dualLayerGrids = wasmGetIndoorDualLayerGrids();
      const playerLayer = wasmGetLinkLayer();

      // If hover-tile requested, open nav widget and trigger tooltip
      let hoverScreenshot: string | null = null;
      let hoverVerification: { layer0: number; layer1: number; wouldSplit: boolean } | null = null;

      if (hoverTile && viewport) {
        console.log(`[DumpLayers] Hover tile requested: [${hoverTile.col}, ${hoverTile.row}]`);

        // Verify the data at this tile first (before any UI interaction)
        if (dualLayerGrids) {
          const l0 = dualLayerGrids.layer0[hoverTile.row]?.[hoverTile.col] ?? -1;
          const l1 = dualLayerGrids.layer1[hoverTile.row]?.[hoverTile.col] ?? -1;
          const wouldSplit = l0 !== l1;

          // Boundary-component check: is layer1 an enclosed, reachable interior here?
          const layer1Reachable = l1 === 0x00 && wouldSplit
            ? isLayer1Reachable(dualLayerGrids, hoverTile.row, hoverTile.col)
            : false;

          const tooltipWouldShow = wouldSplit && (layer1Reachable || l1 !== 0x00);
          hoverVerification = { layer0: l0, layer1: l1, wouldSplit };
          console.log(`[DumpLayers] Data at [${hoverTile.col},${hoverTile.row}]: layer0=0x${l0.toString(16)}, layer1=0x${l1.toString(16)}, wouldSplit=${wouldSplit}`);
          console.log(`[DumpLayers] layer1Reachable=${layer1Reachable}, tooltipWouldShow=${tooltipWouldShow}`);
        } else {
          console.log(`[DumpLayers] No dual-layer grids (single-layer room), so the tooltip would NOT show split`);
        }

        // Navigation widget is auto-opened via autoFlood (--hover-tile implies autoFlood in preload).
        // The flood fill auto-runs. Wait for TileInspector to appear (flood must complete first).
        openNavWidget(); // Open the navigation widget
        console.log('[DumpLayers] Navigation widget opened. Waiting for flood button...');

        // Wait for the flood button to appear (widget rendered)
        const floodBtn = await waitForElement('[data-testid="nav-flood-btn"]', 5000);
        if (!floodBtn) {
          console.log('[DumpLayers] ERROR: Flood button not found in DOM');
        } else {
          // Click the flood fill button
          console.log('[DumpLayers] Clicking flood fill button...');
          (floodBtn as HTMLButtonElement).click();

          // Wait for the TileInspector to appear (flood fill completing renders the overlay)
          console.log('[DumpLayers] Waiting for flood fill to complete (TileInspector)...');
        }

        const tileInspector = await waitForElement('[data-testid="tile-inspector"]', 20000);

        if (tileInspector) {
          console.log('[DumpLayers] TileInspector found. Setting tooltip via __debugHoverTile...');

          // Use the exposed debug function to directly set tooltip state
          // Wait a tick for the useEffect to register the global
          await new Promise((r) => setTimeout(r, 200));

          const debugFn = (window as any).__debugHoverTile;
          if (debugFn) {
            const success = debugFn(hoverTile.col, hoverTile.row);
            console.log(`[DumpLayers] __debugHoverTile(${hoverTile.col}, ${hoverTile.row}) = ${success}`);
          } else {
            console.log('[DumpLayers] WARNING: __debugHoverTile not available');
          }

          // Wait for React to process the state update and render tooltip
          await new Promise((r) => setTimeout(r, 500));

          // Take screenshot showing the tooltip
          hoverScreenshot = await window.api.takeScreenshot(`dump-layers-hover-${hoverTile.col}-${hoverTile.row}`);
          console.log(`[DumpLayers] Hover screenshot: ${hoverScreenshot}`);
        } else {
          console.log('[DumpLayers] ERROR: TileInspector not found in DOM after 10s');
        }
      }

      const output = {
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

      console.log(`[DumpLayers] hasDualLayers=${output.hasDualLayers}, linkLayer=${playerLayer}`);
      if (output.grids) {
        console.log(`[DumpLayers] ${output.grids.splitTiles.length} tiles with layer split`);
      } else {
        console.log('[DumpLayers] No dual layers (single-layer room or layers identical after normalization)');
      }

      if (hoverVerification) {
        const has0x1C = hoverVerification.layer0 === 0x1C || hoverVerification.layer1 === 0x1C;
        if (has0x1C) {
          console.log(`[DumpLayers] ⚠️  BUG: Tile [${hoverTile!.col},${hoverTile!.row}] has 0x1C (normalization failed!): layer0=0x${hoverVerification.layer0.toString(16)}, layer1=0x${hoverVerification.layer1.toString(16)}`);
        } else if (hoverVerification.wouldSplit) {
          console.log(`[DumpLayers] ✓ NO 0x1C: Tile [${hoverTile!.col},${hoverTile!.row}] has legitimate split (layer0=0x${hoverVerification.layer0.toString(16)}, layer1=0x${hoverVerification.layer1.toString(16)})`);
        } else {
          console.log(`[DumpLayers] ✓ FIX VERIFIED: Tile [${hoverTile!.col},${hoverTile!.row}] layers match (both = 0x${hoverVerification.layer0.toString(16)})`);
        }
      }

      const path = await window.api.writeDumpLayers(output);
      console.log(`[DumpLayers] Output written to: ${path}`);

      // Exit after dump
      setTimeout(() => window.close(), 500);
    })();

    return () => { cancelled = true; };
  }, [activeProfile]);
};

export { useDumpLayers };
