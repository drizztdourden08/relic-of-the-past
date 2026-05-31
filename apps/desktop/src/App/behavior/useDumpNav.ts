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
} from '../../lib/game';
import { resolveCurrentScreenDetailed } from '@shared/game/data/screens';
import type { VariantGameState } from '@shared/game/data/screens';

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

      const exitScreen = exitScreenMap.get(roomIndex) ?? null;

      // Fall hole entrance IDs (these are excluded from regular entrance markers in the widget)
      const fallHoleEntIds = new Set<number>();
      for (const h of fallHoles) fallHoleEntIds.add(h.entranceId);

      // Overworld door entrance IDs (physical doors on overworld)
      const owEntrances = wasmGetOverworldEntrances();
      const overworldDoorEntIds = new Set<number>();
      for (const e of owEntrances) overworldDoorEntIds.add(e.id);

      // Find all entrance IDs whose destination room matches current room
      const matchingEntrances: Array<{ id: number; spawnX: number; spawnY: number; gridRow: number; gridCol: number; isFallHole: boolean; isOverworldDoor: boolean; classification: string }> = [];
      if (entranceRooms && entranceSpawns) {
        const roomOriginX = (roomIndex % 16) * 512;
        const roomOriginY = Math.floor(roomIndex / 16) * 512;
        for (let id = 0; id < entranceRooms.length; id++) {
          if (entranceRooms[id] !== roomIndex) continue;
          const spawn = entranceSpawns[id];
          if (!spawn) continue;
          const gridCol = Math.floor((spawn.x - roomOriginX) / 8);
          const gridRow = Math.floor((spawn.y - roomOriginY) / 8);
          const isFallHole = fallHoleEntIds.has(id);
          const isOverworldDoor = overworldDoorEntIds.has(id);
          const classification = isFallHole ? 'fall-hole' : isOverworldDoor ? 'overworld-door' : 'respawn/special';
          matchingEntrances.push({ id, spawnX: spawn.x, spawnY: spawn.y, gridRow, gridCol, isFallHole, isOverworldDoor, classification });
        }
      }

      // Fall hole landings in this room
      const fallHoleLandings: Array<{ entranceId: number; gridRow: number; gridCol: number; fromArea: number; fromAreaHex: string }> = [];
      if (entranceRooms && entranceSpawns) {
        const roomOriginX = (roomIndex % 16) * 512;
        const roomOriginY = Math.floor(roomIndex / 16) * 512;
        for (const h of fallHoles) {
          if (entranceRooms[h.entranceId] === roomIndex) {
            const spawn = entranceSpawns[h.entranceId];
            if (spawn) {
              const gridCol = Math.floor((spawn.x - roomOriginX) / 8);
              const gridRow = Math.floor((spawn.y - roomOriginY) / 8);
              fallHoleLandings.push({ entranceId: h.entranceId, gridRow, gridCol, fromArea: h.area, fromAreaHex: `0x${h.area.toString(16).padStart(2, '0')}` });
            }
          }
        }
      }

      // Stair info
      const stairInfo = stairs.map((s, i) => ({
        index: i,
        destRoom: s.destRoom,
        row: s.row,
        col: s.col,
        destRoomHex: `0x${s.destRoom.toString(16).padStart(4, '0')}`,
      })).filter(s => s.destRoom !== 0);

      // Travel destinations from room header
      const travelDests = wasmGetRoomTravelDestinations();
      const travelDestsFormatted = travelDests ? travelDests.map((d, i) => ({
        index: i,
        room: d,
        roomHex: `0x${d.toString(16).padStart(2, '0')}`,
        label: i === 0 ? 'pit/block' : `stair${i - 1}`,
      })).filter(td => td.room !== 0) : null;

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
