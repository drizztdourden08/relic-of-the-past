/* @layer renderer-appshell @kind hook */
import { appApi } from '@app/ipc/app-api';
import { useEffect, useRef } from 'react';
import { loadState, wasmGetIndoorDualLayerGrids, wasmGetLinkLayer, wasmGetViewportInfo } from '@app/game';
import type { DumpLayersDeps } from './useDumpLayers.type';
import type { HoverVerification } from './dump-layers.type';
import { EXIT_DELAY_MS, RENDER_SETTLE_MS } from './auto-launch.constants';
import { waitForGameRunning } from './wait-for-game-running';
import { readRoomIndex } from './read-room-index';
import { verifyHoverTile } from './verify-hover-tile';
import { captureHoverTooltip } from './capture-hover-tooltip';
import { findSplitTiles } from './find-split-tiles';
import { logHoverVerdict } from './log-hover-verdict';

const useDumpLayers = ({ activeProfile, loadProfileForGame, openNavWidget }: DumpLayersDeps) => {
  const didRun = useRef(false);

  useEffect(() => {
    if (!activeProfile || didRun.current) return;

    let cancelled = false;

    void (async () => {
      const slot = await appApi().getDumpLayersSlot();
      const hoverTile = await appApi().getHoverTile();
      console.log(`[DumpLayers] hook fired. slot=${slot}, hoverTile=${JSON.stringify(hoverTile)}, profile=${activeProfile.name}`);
      if (slot === null) return;

      didRun.current = true;

      console.log(`[DumpLayers] Starting game for profile: ${activeProfile.name}`);
      await loadProfileForGame(activeProfile);

      await waitForGameRunning(() => cancelled);
      if (cancelled) return;

      console.log(`[DumpLayers] Game running. Loading state slot ${slot}...`);
      await loadState(slot);

      await new Promise((r) => setTimeout(r, RENDER_SETTLE_MS));
      if (cancelled) return;

      console.log('[DumpLayers] Taking screenshot...');
      const screenshotPath = await appApi().takeScreenshot(`dump-layers-state${slot}`);
      console.log(`[DumpLayers] Screenshot: ${screenshotPath}`);

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

      if (hoverVerification && hoverTile) logHoverVerdict(hoverTile, hoverVerification);

      const path = await appApi().writeDumpLayers(output);
      console.log(`[DumpLayers] Output written to: ${path}`);

      setTimeout(() => window.close(), EXIT_DELAY_MS);
    })();

    return () => { cancelled = true; };
  }, [activeProfile]);
};

export { useDumpLayers };
