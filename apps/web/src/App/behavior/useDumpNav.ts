/* @layer renderer-appshell @kind hook */
/**
 * Debug hook: reacts to --dump-nav=N CLI flag.
 *
 * Starts the game, loads save state N, reads navigation state
 * (screen detection, entrances, transitions, exits, stairs)
 * from WASM, writes to debug-output/dump-nav.json, then exits.
 */

import { useEffect, useRef } from 'react';
import {
  subscribeGameState,
  loadState,
  wasmGetViewportInfo,
  wasmGetGameUIState,
  wasmGetExitScreenMap,
  wasmGetEntranceRooms,
  wasmGetEntranceSpawns,
  wasmGetRoomStairInfo,
  wasmGetRoomTravelDestinations,
  wasmGetFallHoles,
  wasmGetOverworldEntrances,
  wasmGetProgressIndicator,
  wasmGetRoomDoorBoundaryTiles,
  wasmGetRoomLayoutInfo,
  wasmGetLinkLayer,
  wasmGetStaircaseType,
  wasmBuildRoomAttrGrid,
  wasmGetToggleFloorPositions,
  wasmGetIndoorDualLayerGrids,
} from '../../lib/game';
import { resolveCurrentScreenDetailed } from '@shared/game/data/screens';
import type { VariantGameState } from '@shared/game/data/screens';
import { collectEntranceData, formatStairs, formatTravelDests, computeFloodFill } from './dump-nav/builders';

interface DumpNavDeps {
  activeProfile: Profile | null;
  loadProfileForGame: (profile: Profile) => Promise<void>;
}

const useDumpNav = ({ activeProfile, loadProfileForGame }: DumpNavDeps) => {
  const didRun = useRef(false);

  useEffect(() => {
    if (!activeProfile || didRun.current) return;
    let cancelled = false;

    (async () => {
      const slot = await window.api.getDumpNavSlot();
      if (slot === null) return;
      didRun.current = true;

      console.log(`[DumpNav] Starting game for profile: ${activeProfile.name}`);
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

      console.log(`[DumpNav] Game running. Loading state slot ${slot}...`);
      const loadResult = await loadState(slot);
      console.log(`[DumpNav] loadState(${slot}) returned: ${loadResult}`);
      if (!loadResult) {
        const dump = { slot, error: `loadState(${slot}) returned false — save state not found or module not ready` };
        await window.api.writeDumpNav(dump);
        setTimeout(() => window.close(), 500);
        return;
      }
      await new Promise((r) => setTimeout(r, 3000));
      if (cancelled) return;

      // ─── Collect game state ───
      const uiState = wasmGetGameUIState();
      let roomIndex = 0, palaceIndex = 0xFF, overworldScreenIndex = 0;
      let isIndoors = false, whichEntrance = 0;

      if (uiState) {
        const { heap, ptr } = uiState;
        // Match offsets from ui-bridge.ts parseGameUIBuffer
        roomIndex = heap[ptr + 77] | (heap[ptr + 78] << 8);
        palaceIndex = heap[ptr + 75] | (heap[ptr + 76] << 8);
        overworldScreenIndex = heap[ptr + 109] | (heap[ptr + 110] << 8);
        isIndoors = heap[ptr + 111] !== 0;
        whichEntrance = heap[ptr + 119];
      }

      const viewport = wasmGetViewportInfo();
      const progressInfo = wasmGetProgressIndicator();

      // ─── Screen detection ───
      const variantState: VariantGameState = {
        progressTier: progressInfo?.tier,
        entranceId: whichEntrance || undefined,
      };
      const detection = resolveCurrentScreenDetailed(isIndoors, palaceIndex, roomIndex, overworldScreenIndex, whichEntrance, variantState);

      // ─── Entrance data ───
      const exitScreenMap = wasmGetExitScreenMap();
      const entranceRooms = wasmGetEntranceRooms();
      const entranceSpawns = wasmGetEntranceSpawns();
      const stairs = wasmGetRoomStairInfo();
      const fallHoles = wasmGetFallHoles();
      const owEntrances = wasmGetOverworldEntrances();

      const exitScreen = exitScreenMap.get(roomIndex) ?? null;

      const { matchingEntrances, fallHoleLandings } = collectEntranceData({
        roomIndex, entranceRooms, entranceSpawns, fallHoles, owEntrances,
      });

      // Stair info
      const stairInfo = formatStairs(stairs);

      // Travel destinations from room header
      const travelDestsFormatted = formatTravelDests(wasmGetRoomTravelDestinations());

      // ─── Door & room structure data ───
      const doorBoundaryTiles = isIndoors ? wasmGetRoomDoorBoundaryTiles() : [];
      const roomLayout = isIndoors ? wasmGetRoomLayoutInfo() : null;
      const linkLayer = isIndoors ? wasmGetLinkLayer() : null;
      const staircaseType = isIndoors ? wasmGetStaircaseType() : null;
      const attrGrid = isIndoors ? wasmBuildRoomAttrGrid(roomIndex) : null;
      // After WasmBuildRoomAttrGrid, toggle floor positions are populated
      const toggleFloorPositions = isIndoors ? wasmGetToggleFloorPositions() : [];

      // ─── Flood fill + connections (for internal edge verification) ───
      const floodFillData = isIndoors
        ? computeFloodFill({
            roomIndex, attrGrid, dualLayerGrids: wasmGetIndoorDualLayerGrids(), linkLayer, staircaseType, roomLayout,
          })
        : null;

      const dump = {
        slot,
        isIndoors,
        roomIndex,
        roomIndexHex: `0x${roomIndex.toString(16).padStart(4, '0')}`,
        palaceIndex,
        palaceIndexHex: `0x${palaceIndex.toString(16).padStart(2, '0')}`,
        overworldScreenIndex,
        overworldScreenIndexHex: `0x${overworldScreenIndex.toString(16).padStart(2, '0')}`,
        whichEntrance,
        whichEntranceHex: `0x${whichEntrance.toString(16).padStart(2, '0')}`,
        progressTier: progressInfo?.tier ?? null,
        progressLabel: progressInfo?.label ?? null,
        viewport: viewport ? { locationType: viewport.locationType } : null,
        detection: detection ? {
          screenId: detection.screen.id,
          screenName: detection.screen.name,
          method: detection.method,
          hasVariant: !!detection.screen.variant,
          variantKey: detection.screen.variant?.key ?? null,
        } : null,
        exitScreen,
        exitScreenHex: exitScreen != null ? `0x${exitScreen.toString(16).padStart(2, '0')}` : null,
        entrancesPointingHere: matchingEntrances,
        fallHoleLandings,
        stairs: stairInfo,
        travelDestinations: travelDestsFormatted,
        summary: {
          totalEntrances: matchingEntrances.filter(e => !e.isFallHole).length + stairInfo.length,
          overworldExits: exitScreen != null ? 1 : 0,
          stairConnections: stairInfo.length,
          entranceSpawns: matchingEntrances.filter(e => !e.isFallHole).length,
          fallHoleLandingCount: fallHoleLandings.length,
          excludedFallHoleIds: matchingEntrances.filter(e => e.isFallHole).map(e => e.id),
        },
        doorBoundaryTiles: doorBoundaryTiles.map(d => {
          const tileAttr = attrGrid ? attrGrid[d.row * 64 + d.col] : null;
          return {
            direction: d.direction,
            col: d.col,
            row: d.row,
            doorType: d.doorType,
            doorTypeHex: `0x${d.doorType.toString(16).padStart(2, '0')}`,
            isOpen: d.isOpen,
            isLayerToggle: d.doorType === 22,
            tileAttr: tileAttr != null ? `0x${tileAttr.toString(16).padStart(2, '0')}` : null,
            tileAttrIsLayerToggle: tileAttr != null && tileAttr >= 0x90 && tileAttr <= 0x97,
          };
        }),
        roomLayout: roomLayout ? {
          layout: roomLayout.layout,
          shape: roomLayout.shape,
          quadrantFullsizeX: roomLayout.quadrantFullsizeX,
          quadrantFullsizeY: roomLayout.quadrantFullsizeY,
          quadrantX: roomLayout.quadrantX,
          quadrantY: roomLayout.quadrantY,
          intraEdges: roomLayout.intraEdges,
        } : null,
        linkLayer,
        staircaseType,
        toggleFloorPositions: toggleFloorPositions.map(p => ({
          pos: `0x${p.pos.toString(16).padStart(4, '0')}`,
          row: p.row,
          col: p.col,
        })),
        floodFill: floodFillData,
      };

      console.log(`[DumpNav] Dumping navigation data...`);
      console.log(JSON.stringify(dump, null, 2));
      const path = await window.api.writeDumpNav(dump);
      console.log(`[DumpNav] Written to: ${path}`);

      // Exit app
      setTimeout(() => window.close(), 500);
    })();

    return () => { cancelled = true; };
  }, [activeProfile]);
};

export { useDumpNav };
