/* @layer renderer-widgets @kind hook */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useGameUIStore } from '../../stores/game-ui-store';
import { useNavigationOverlayStore } from '../../stores/navigation-overlay-store';
import { buildScreenBundle, floodFillScreen, getConnections } from '@shared/game/navigation';
import type { FloodFillOptions, QuadrantBounds, ScreenBundle, FloodFillResult, ConnectionInfo } from '@shared/game/navigation';
import { wasmGetViewportInfo, wasmGetOverworldVariant, wasmGetProgressIndicator, wasmGetIndoorDualLayerGrids, wasmGetIndoorLayer0Grid, wasmGetLinkLayer, wasmGetStaircaseType, wasmGetIndoorUncleBlockers, wasmGetLiveSprites, wasmGetOverworldGuardSpawns, wasmBuildOverworldAttrGrid, wasmGetOverworldEntrances, wasmGetFallHoles, wasmGetExitScreenMap, wasmGetAreaHeads, wasmGetEntranceRooms, wasmGetEntranceSpawns, wasmGetRoomLayoutInfo, wasmGetDungeonMapPosition, wasmGetRoomExitDoors, wasmGetRoomStairInfo, wasmGetRoomWalkBoundaries, wasmGetToggleFloorPositions } from '../../lib/game';
import { getCompletedChecks } from '../../lib/game/tracker';
import type { OverworldVariantInfo } from '../../lib/game';
import type { TileAttrContext } from '@shared/game/navigation/tile-attrs';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import { enrichEntrances, uint8ToGrid, computeBigScreenGroup } from './widget-helpers';
import { useScreenDetection, useLinkDebugState, useAutoFloodTrigger } from './hooks';

/** All Navigation-widget state, data acquisition, and flood-fill orchestration. */
const useNavigation = () => {
  const { overworldScreenIndex, roomIndex, isIndoors, isDarkWorld, palaceIndex, whichEntrance, linkX, linkY } = useGameUIStore(s => s.map);
  const equipment = useGameUIStore(s => s.equipment);
  const inventoryItems = useGameUIStore(s => s.inventory.items);
  const overlayStore = useNavigationOverlayStore();
  const [result, setResult] = useState<FloodFillResult | null>(null);
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [fallHoleLandings, setFallHoleLandings] = useState<Array<{ gridRow: number; gridCol: number; entranceId: number }>>([]);
  const [respawnEntIds, setRespawnEntIds] = useState<Set<number>>(new Set());

  const [running, setRunning] = useState(false);
  const [autoRun, setAutoRun] = useState(window.api.autoFlood ?? false);
  const [variant, setVariant] = useState<OverworldVariantInfo | null>(null);
  const [dynamicBlockerCount, setDynamicBlockerCount] = useState(0);
  const [visibleScreenIndices, setVisibleScreenIndices] = useState<number[]>([]);
  const [screenBundle, setScreenBundle] = useState<ScreenBundle | null>(null);
  const [debugTick, setDebugTick] = useState(0);
  const handleRunRef = useRef<(() => Promise<void>) | null>(null);
  const prevInventoryKeyRef = useRef<string | null>(null);
  const pendingAutoSecondPassRef = useRef(false);
  const autoSecondPassTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Capture Link's layer at the moment a room loads (the "starting layer" for this room visit)
  const [roomStartLayer, setRoomStartLayer] = useState<number | null>(null);
  const prevRoomForLayerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isIndoors) { setRoomStartLayer(null); return; }
    if (prevRoomForLayerRef.current !== roomIndex) {
      prevRoomForLayerRef.current = roomIndex;
      const layer = wasmGetLinkLayer?.() ?? null;
      setRoomStartLayer(layer);
    }
  }, [isIndoors, roomIndex, debugTick]);

  // Dungeon map position and room layout (refreshed on room/tick changes)
  const dungeonMapPos = useMemo(() => {
    if (!isIndoors || palaceIndex === 0xFF) return null;
    return wasmGetDungeonMapPosition();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIndoors, roomIndex, palaceIndex, debugTick]);

  const roomLayoutInfo = useMemo(() => {
    if (!isIndoors) return null;
    return wasmGetRoomLayoutInfo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIndoors, roomIndex, debugTick]);

  // Use room index indoors; overworld screen index outside.
  const activeScreenIndex = isIndoors ? roomIndex : overworldScreenIndex;

  // Poll variant info on screen changes
  useEffect(() => {
    if (isIndoors) { setVariant(null); return; }
    const v = wasmGetOverworldVariant(overworldScreenIndex);
    setVariant(v);
  }, [overworldScreenIndex, isIndoors]);

  // ─── Screen detection: single source of truth ───
  const detectionResult = useScreenDetection(debugTick);
  const progressInfo = wasmGetProgressIndicator();
  const detectedScreen = detectionResult?.screen ?? null;
  const screenName = detectedScreen?.name
    ?? (isIndoors ? `Room 0x${roomIndex.toString(16).toUpperCase().padStart(4, '0')}` : `Screen 0x${overworldScreenIndex.toString(16).toUpperCase().padStart(2, '0')}`);
  const displayedVariant = !isIndoors
    ? (result ? wasmGetOverworldVariant(result.screenIndex) : variant)
    : null;
  const renderResults = overlayStore.results.length > 0
    ? overlayStore.results
    : (result ? [result] : []);
  const reachableSum = renderResults.reduce((sum, r) => sum + r.reachableCount, 0);
  const totalTilesSum = renderResults.reduce((sum, r) => sum + r.totalTiles, 0);
  const entranceSum = renderResults.reduce((sum, r) => sum + r.entrances.filter(e => r.transitions.some(t => t.entranceIdx === e.id)).length, 0);

  // Force a lightweight periodic rerender so live debug values update while moving.
  useEffect(() => {
    const id = setInterval(() => setDebugTick(t => (t + 1) & 1023), 200);
    return () => clearInterval(id);
  }, []);
  const linkDebug = useLinkDebugState(debugTick);

  // Clear overlay and screen bundle when screen changes
  useEffect(() => {
    if (result && result.screenIndex !== activeScreenIndex) {
      setResult(null);
      setConnections([]);
      overlayStore.clear();
    }
    // Always clear stale screen bundle when active screen changes
    setScreenBundle(prev => {
      if (!prev) return prev;
      // Keep bundle if it still matches current screen
      if (prev.screens.includes(activeScreenIndex) || prev.head === activeScreenIndex) return prev;
      return null;
    });
  }, [activeScreenIndex]);

  // Run flood fill
  const handleRun = useCallback(async () => {
    if (running) return;

    // For indoor rooms, bail early if tile data isn't available yet (transition in progress).
    // wasmGetIndoorLayer0Grid returns null ONLY when game isn't running or room not loaded.
    // (wasmGetIndoorDualLayerGrids returns null for single-layer rooms too, which is valid.)
    if (isIndoors) {
      const layer0 = wasmGetIndoorLayer0Grid();
      if (!layer0) {
        return; // Auto-trigger hook will retry on next tick
      }
    }

    setRunning(true);
    try {
      const vp = wasmGetViewportInfo?.();
      const liveOverworldScreenIndex = vp
        ? ((((vp.linkY >> 9) & 7) << 3) | ((vp.linkX >> 9) & 7))
        : overworldScreenIndex;
      const primaryScreenIndex = isIndoors ? activeScreenIndex : liveOverworldScreenIndex;

      // Build inventory from current equipment state
      // lift.1=bushes/pots (no glove), lift.2=Power Glove (light rocks), lift.3=Titan's Mitt (dark rocks)
      const items: string[] = ['lift.1'];
      if (equipment.gloves >= 1) items.push('lift.2');
      if (equipment.gloves >= 2) items.push('lift.3');
      if (equipment.boots) items.push('boots');
      if (equipment.flippers) items.push('flippers');
      if (inventoryItems[2] >= 1) items.push('hookshot');
      if (inventoryItems[11] >= 1) items.push('hammer');

      // Calculate Link's position relative to the screen being analyzed.
      // Indoors: infer current 512x512 room chunk from Link world coordinates.
      let startPos: { row: number; col: number } | undefined;
      let tileContext: TileAttrContext = isIndoors ? 'interior-house' : 'overworld';
      let rawAttrGrid: number[][] | undefined;
      let dualLayerGrids: { layer0: number[][]; layer1: number[][]; stairTiles: Array<{ row: number; col: number }> } | undefined;
      let linkLayer: 0 | 1 | undefined;
      let blockerWorldPoints: Array<{ x: number; y: number }> = [];

      // Build overworld dynamic blockers from live sprite data independently of viewport
      // so blockers don't disappear if viewport data is transiently unavailable.
      if (!isIndoors) {
        const live = wasmGetLiveSprites();
        const staticGuards = wasmGetOverworldGuardSpawns();
        // Only specific sprites block BFS: tutorial guards (0x3F), barriers (0x40),
        // and uncle (0x73 with e=0). Regular enemies are completely ignored.
        const livePoints = live.flatMap(s => {
          if (s.type === 0x3f || s.type === 0x40 || (s.type === 0x73 && s.e === 0)) {
            const pts: Array<{ x: number; y: number }> = [];
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                pts.push({ x: s.x + dc * 8, y: s.y + dr * 8 });
              }
            }
            return pts;
          }
          return [];
        });

        const staticGuardPoints = staticGuards.flatMap(g => {
          const pts: Array<{ x: number; y: number }> = [];
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              pts.push({ x: g.x + dc * 8, y: g.y + dr * 8 });
            }
          }
          return pts;
        });

        const blockers: Array<{ x: number; y: number }> = [];
        const seen = new Set<string>();
        for (const p of [...livePoints, ...staticGuardPoints]) {
          const key = `${p.x},${p.y}`;
          if (seen.has(key)) continue;
          seen.add(key);
          blockers.push(p);
        }
        blockerWorldPoints = blockers;
      }

      if (vp) {
        if (isIndoors) {
          // TileDetect only branches on indoors, but we keep cave/house and dungeon contexts separate for future tuning.
          tileContext = vp.locationType === 2 ? 'interior-dungeon' : 'interior-house';
          dualLayerGrids = wasmGetIndoorDualLayerGrids() ?? undefined;
          rawAttrGrid = dualLayerGrids?.layer0 ?? wasmGetIndoorLayer0Grid() ?? undefined;
          linkLayer = wasmGetLinkLayer() ?? undefined;

          // Early-game indoor variant: Uncle at house / in-passage physically blocks tiles.
          // We stamp his live sprite footprint into the attr grid so flood-fill reflects state.
          // Once the uncle check is collected, he no longer blocks (randomizer-safe).
          if (rawAttrGrid && !getCompletedChecks().has("Link's Uncle")) {
            const blockers = wasmGetIndoorUncleBlockers();
            const roomWorldX = Math.floor(vp.linkX / 512) * 512;
            const roomWorldY = Math.floor(vp.linkY / 512) * 512;
            // Uncle uses 3x3 expanded footprint (same as overworld guards)
            // to properly block narrow passages.
            for (const b of blockers) {
              const c0 = Math.floor((b.x - roomWorldX) / 8);
              const r0 = Math.floor((b.y - roomWorldY) / 8);
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  const rr = r0 + dr;
                  const cc = c0 + dc;
                  if (rr >= 0 && rr < 64 && cc >= 0 && cc < 64) {
                    rawAttrGrid[rr][cc] = 0x01; // wall/blocked
                  }
                }
              }
            }
          }
        }
        const screenWorldX = isIndoors
          ? (Math.floor(vp.linkX / 512) * 512)
          : ((primaryScreenIndex & 7) * 512);
        const screenWorldY = isIndoors
          ? (Math.floor(vp.linkY / 512) * 512)
          : (((primaryScreenIndex >> 3) & 7) * 512);

        const relPixelX = vp.linkX - screenWorldX;
        const relPixelY = (vp.linkY + 8) - screenWorldY; // collision hitbox starts 8px below sprite top

        // Match overlay debug footprint: Link's hitbox is the lower 16x16 (skip head).
        const tileMinCol = Math.floor(relPixelX / 8);
        const tileMaxCol = Math.floor((relPixelX + 15) / 8);
        const tileMinRow = Math.floor(relPixelY / 8);
        const tileMaxRow = Math.floor((relPixelY + 15) / 8);

        const centerCol = relPixelX / 8 + 0.5;
        const centerRow = relPixelY / 8 + 0.5;
        const clamp = (v: number) => Math.max(0, Math.min(63, v));

        let best: { row: number; col: number } | null = null;
        let bestD2 = Number.POSITIVE_INFINITY;
        for (let r = tileMinRow; r <= tileMaxRow; r++) {
          for (let c = tileMinCol; c <= tileMaxCol; c++) {
            const rr = clamp(r);
            const cc = clamp(c);
            const dr = rr - centerRow;
            const dc = cc - centerCol;
            const d2 = dr * dr + dc * dc;
            if (d2 < bestD2) {
              bestD2 = d2;
              best = { row: rr, col: cc };
            }
          }
        }
        startPos = best ?? { row: clamp(Math.floor(centerRow)), col: clamp(Math.floor(centerCol)) };
      }

      // Helper to build dynamic blockers for a given screen
      const getBlockersForScreen = (screenIndex: number) => !isIndoors
        ? blockerWorldPoints
          .map(b => ({
            row: Math.floor((b.y - (((screenIndex >> 3) & 7) * 512)) / 8),
            col: Math.floor((b.x - ((screenIndex & 7) * 512)) / 8),
          }))
          .filter(p => p.row >= 0 && p.row < 64 && p.col >= 0 && p.col < 64)
        : undefined;

      // Get entrance data + exit map from WASM (cached per run)
      const allEntrances = enrichEntrances();
      const exitScreenByRoom = wasmGetExitScreenMap();

      // Collect fall-hole entrance IDs to exclude from regular entrance markers
      const fallHoleEntIds = new Set<number>();
      {
        const holes = wasmGetFallHoles();
        for (const h of holes) fallHoleEntIds.add(h.entranceId);
      }

      // Collect overworld door entrance IDs — only these represent physical doors.
      // Entrance IDs NOT in this set are file-load respawn points or special spawns.
      const overworldDoorEntIds = new Set<number>();
      {
        const owEntrances = wasmGetOverworldEntrances();
        for (const e of owEntrances) overworldDoorEntIds.add(e.id);
      }

      // For indoor rooms: add entrance spawn positions from the kEntranceData tables.
      // Physical overworld doors and respawn/special spawns are both shown (with different icons).
      // Exclude fall-hole entrance IDs (handled separately as fall hole landings).
      const currentRespawnIds = new Set<number>();
      if (isIndoors) {
        const exitScreen = exitScreenByRoom.get(primaryScreenIndex);
        if (exitScreen != null) {
          const spawns = wasmGetEntranceSpawns();
          const rooms = wasmGetEntranceRooms();
          const exitDoors = wasmGetRoomExitDoors();
          console.log('[EXIT-DIAG] room=0x' + primaryScreenIndex.toString(16) + ' exitDoors=', JSON.stringify(exitDoors));
          if (spawns && rooms) {
            const roomOriginX = (primaryScreenIndex % 16) * 512;
            const roomOriginY = Math.floor(primaryScreenIndex / 16) * 512;
            // Use exit door trigger positions (from room door data) for overworld exits.
            // Match entrance IDs to exit doors by proximity to their spawn positions.
            const exitDoorPositions = exitDoors.map(d => ({ row: d.row, col: d.col, dir: d.direction, used: false }));
            for (let id = 0; id < rooms.length; id++) {
              if (rooms[id] !== primaryScreenIndex) continue;
              if (fallHoleEntIds.has(id)) continue; // fall-hole landings shown separately
              if (!overworldDoorEntIds.has(id)) currentRespawnIds.add(id); // track respawn IDs
              const spawn = spawns[id];
              if (!spawn) continue;
              const spawnCol = Math.floor((spawn.x - roomOriginX) / 8);
              const spawnRow = Math.floor((spawn.y - roomOriginY) / 8);
              // For overworld door entrances, try to use the actual exit door tile position
              let gridCol = spawnCol;
              let gridRow = spawnRow;
              if (overworldDoorEntIds.has(id) && exitDoorPositions.length > 0) {
                // Find nearest unused exit door to this spawn position
                let bestIdx = -1;
                let bestDist = Infinity;
                for (let ei = 0; ei < exitDoorPositions.length; ei++) {
                  if (exitDoorPositions[ei].used) continue;
                  const dr = exitDoorPositions[ei].row - spawnRow;
                  const dc = exitDoorPositions[ei].col - spawnCol;
                  const dist = dr * dr + dc * dc;
                  if (dist < bestDist) { bestDist = dist; bestIdx = ei; }
                }
                if (bestIdx >= 0) {
                  exitDoorPositions[bestIdx].used = true;
                  const doorDir = exitDoorPositions[bestIdx].dir;
                  // Offset to center on the passable door tiles
                  if (doorDir === 'south') {
                    gridCol = exitDoorPositions[bestIdx].col + 1;
                    gridRow = exitDoorPositions[bestIdx].row + 3;
                  } else if (doorDir === 'north') {
                    gridCol = exitDoorPositions[bestIdx].col + 1;
                    gridRow = exitDoorPositions[bestIdx].row + 4;
                  } else if (doorDir === 'west') {
                    gridCol = exitDoorPositions[bestIdx].col + 2;
                    gridRow = exitDoorPositions[bestIdx].row + 1;
                  } else {
                    gridCol = exitDoorPositions[bestIdx].col + 2;
                    gridRow = exitDoorPositions[bestIdx].row + 1;
                  }
                  console.log(`[EXIT-DIAG] ent id=${id} overworldDoor → exitDoor[${bestIdx}] row=${gridRow} col=${gridCol} dir=${doorDir} (spawn was row=${spawnRow} col=${spawnCol})`);
                }
              } else {
                console.log(`[EXIT-DIAG] ent id=${id} isOwDoor=${overworldDoorEntIds.has(id)} exitDoorsLen=${exitDoorPositions.length} → spawn row=${spawnRow} col=${spawnCol}`);
              }
              if (gridRow < 0 || gridRow >= 64 || gridCol < 0 || gridCol >= 64) continue;
              // Replace overworld entry (wrong grid coords) with correct indoor spawn position
              const existingIdx = allEntrances.findIndex(e => e.id === id);
              if (existingIdx !== -1) {
                allEntrances[existingIdx] = { area: primaryScreenIndex, pos: 0, id, gridRow, gridCol, roomId: exitScreen };
                continue;
              }
              allEntrances.push({
                area: primaryScreenIndex,
                pos: 0,
                id,
                gridRow,
                gridCol,
                roomId: exitScreen,
              });
            }
          }
        }

        // Add inter-room stair connections from room header data.
        // These are room-to-room transitions via stair tiles (0x22/0x34).
        const stairs = wasmGetRoomStairInfo();
        for (let i = 0; i < stairs.length; i++) {
          const stair = stairs[i];
          if (stair.destRoom === 0) continue;
          const syntheticId = 1000 + i;
          allEntrances.push({
            area: primaryScreenIndex,
            pos: 0,
            id: syntheticId,
            gridRow: stair.row,
            gridCol: stair.col,
            roomId: stair.destRoom,
          });
        }

        // Add inter-room walk-through boundaries (palace toggle doors like Castle→Sewer).
        const walkBounds = wasmGetRoomWalkBoundaries();
        for (let i = 0; i < walkBounds.length; i++) {
          const wb = walkBounds[i];
          if (wb.destRoom === 0) continue;
          const syntheticId = 2000 + i;
          allEntrances.push({
            area: primaryScreenIndex,
            pos: 0,
            id: syntheticId,
            gridRow: wb.row,
            gridCol: wb.col,
            roomId: wb.destRoom,
          });
        }

        // When indoors, remove overworld entrances that don't belong to this room.
        // Overworld screen IDs overlap with indoor room IDs (e.g., OW screen 0x51 vs
        // indoor room 0x51), causing unrelated overworld entrances to leak through.
        const rooms = wasmGetEntranceRooms();
        if (rooms) {
          for (let i = allEntrances.length - 1; i >= 0; i--) {
            const e = allEntrances[i];
            if (e.id >= 200) continue; // fall holes (200+) and stairs (1000+) are fine
            if (rooms[e.id] === primaryScreenIndex) continue; // entrance belongs to this room
            // Remove: this is an overworld entrance that doesn't target this indoor room
            if (overworldDoorEntIds.has(e.id) && rooms[e.id] !== primaryScreenIndex) {
              allEntrances.splice(i, 1);
            }
          }
        }
      }

      // Get room layout info for intra-room edge detection (indoor only)
      const roomLayout = isIndoors ? wasmGetRoomLayoutInfo() : null;
      const intraEdges = roomLayout?.intraEdges ?? [];

      // Indoor multi-screen rooms: do NOT restrict BFS with quadrant bounds.
      // The constrainVoidTiles logic already prevents flooding through structural void
      // into genuinely disconnected halves. Quadrant bounds would incorrectly prevent
      // BFS from reaching connected halves (e.g. room 60 top/bottom).
      const quadrantBounds: QuadrantBounds | undefined = undefined;

      // Helper to run flood fill for one screen directly via orchestrator
      const runOneScreen = (screenIndex: number, sp?: { row: number; col: number }, extraSeeds?: { row: number; col: number }[]) => {
        let grid: number[][];
        if (isIndoors) {
          if (!rawAttrGrid) return null;
          grid = rawAttrGrid;
        } else {
          const raw = wasmBuildOverworldAttrGrid(screenIndex);
          if (!raw) return null;
          grid = uint8ToGrid(raw);
        }
        const runVariant = (!isIndoors) ? wasmGetOverworldVariant(screenIndex) : null;
        const dynamicBlockers = getBlockersForScreen(screenIndex);

        const opts: FloodFillOptions = {
          tileContext,
          inventory: new Set<TileReq>(items as TileReq[]),
          startPos: sp,
          dynamicBlockers,
          entrances: allEntrances,
          exitScreenByRoom,
          quadrantBounds: isIndoors ? quadrantBounds : undefined,
          dualLayerGrids: isIndoors ? dualLayerGrids : undefined,
          stairTiles: isIndoors ? dualLayerGrids?.stairTiles : undefined,
          startLayer: isIndoors ? linkLayer : undefined,
          staircaseType: isIndoors ? (wasmGetStaircaseType?.() ?? undefined) : undefined,
          extraSeeds,
          variant: runVariant ? {
            progressTier: runVariant.progressIndicator,
            eventOverlay: runVariant.eventOverlayActive,
            eventFlags: runVariant.screenEventFlags,
          } : undefined,
        };
        const result = floodFillScreen(grid, screenIndex, opts);
        const connections = getConnections(result, isIndoors ? intraEdges : undefined);
        return { screenIndex, result, connections, dynamicBlockers };
      };

      // Run primary screen first (from Link's position), then iteratively propagate.
      // Indoors: single room only (loading adjacent rooms via wasmBuildRoomAttrGrid
      // corrupts the live game's collision state because Dungeon_LoadRoom is destructive).
      // Outdoors: propagate within the same big-screen group.
      const groupScreens = isIndoors ? [primaryScreenIndex] : computeBigScreenGroup(primaryScreenIndex);
      const allowedScreens = new Set<number>(groupScreens);
      // Indoors: single-room flood fill only (wasmBuildRoomAttrGrid is destructive).
      // We set the screen bundle AFTER flood fill to include adjacent rooms from edges.
      if (!isIndoors) {
        setScreenBundle(buildScreenBundle(groupScreens));
      }
      const MAX_ITERATIONS = 8;
      let iterations = 0;
      const analyzed = new Map<number, NonNullable<ReturnType<typeof runOneScreen>>>();
      const pendingSeeds = new Map<number, { row: number; col: number }[]>();

      pendingSeeds.set(primaryScreenIndex, [startPos!]);

      while (pendingSeeds.size > 0 && iterations < MAX_ITERATIONS) {
        iterations++;
        const batch = [...pendingSeeds.entries()];
        pendingSeeds.clear();

        for (const [screenIndex, seedList] of batch) {
          const sp = seedList[0];
          const entry = runOneScreen(screenIndex, sp, seedList.length > 1 ? seedList.slice(1) : undefined);
          if (!entry) continue;
          analyzed.set(screenIndex, entry);

          // Extract border transitions to discover new adjacent screens
          for (const t of entry.result.transitions) {
            if (t.edge === 'entrance') continue;
            let adjScreen: number | null = null;
            let entryPos: { row: number; col: number } | null = null;
            const sRow = (screenIndex >> 3) & 7;
            const sCol = screenIndex & 7;
            switch (t.edge) {
              case 'north': adjScreen = sRow > 0 ? ((sRow - 1) << 3 | sCol) : null; entryPos = { row: 63, col: t.col }; break;
              case 'south': adjScreen = sRow < 7 ? ((sRow + 1) << 3 | sCol) : null; entryPos = { row: 0, col: t.col }; break;
              case 'west': adjScreen = sCol > 0 ? (sRow << 3 | (sCol - 1)) : null; entryPos = { row: t.row, col: 63 }; break;
              case 'east': adjScreen = sCol < 7 ? (sRow << 3 | (sCol + 1)) : null; entryPos = { row: t.row, col: 0 }; break;
            }
            if (adjScreen === null || entryPos === null) continue;
            if (!allowedScreens.has(adjScreen)) continue;
            if (analyzed.has(adjScreen)) continue;
            const existing = pendingSeeds.get(adjScreen) ?? [];
            existing.push(entryPos);
            pendingSeeds.set(adjScreen, existing);
          }
        }
      }

      const responses = [...analyzed.values()];
      if (responses.length === 0) return;

      setVisibleScreenIndices(responses.map(r => r.screenIndex).sort((a, b) => a - b));

      const fillResults: FloodFillResult[] = responses.map(r => r.result);
      const primaryResult = fillResults.find(r => r.screenIndex === primaryScreenIndex) ?? fillResults[0];

      let allConnections: ConnectionInfo[] = [];
      for (const r of responses) {
        for (const c of r.connections) {
          allConnections.push({ ...c, sourceScreen: r.screenIndex });
        }
      }

      // Annotate all edges with layer toggle info from toggle floor positions.
      // dung_toggle_floor_pos is populated during room load for doors with type 22 (kDoorType_PlayerBgChange).
      // These positions indicate tiles where crossing triggers link_is_on_lower_level ^= 1.
      if (isIndoors) {
        const togglePositions = wasmGetToggleFloorPositions();
        // Threshold: how close a toggle position must be to the room edge to count for that edge
        const EDGE_THRESHOLD = 8;
        const GRID_MAX = 63;
        for (const conn of allConnections) {
          // For N/S edges, connection positions are column indices; for E/W edges, they are row indices
          const useCol = conn.edge === 'north' || conn.edge === 'south';
          const matchingToggles = togglePositions.filter(t => {
            // Check toggle is near the correct edge
            switch (conn.edge) {
              case 'north': return t.row <= EDGE_THRESHOLD;
              case 'south': return t.row >= GRID_MAX - EDGE_THRESHOLD;
              case 'west': return t.col <= EDGE_THRESHOLD;
              case 'east': return t.col >= GRID_MAX - EDGE_THRESHOLD;
            }
          });
          // Check if any matching toggle position overlaps with connection positions
          if (matchingToggles.some(t =>
            conn.positions.some(p => Math.abs(p - (useCol ? t.col : t.row)) <= 3)
          )) {
            conn.layerToggle = true;
          }
        }
      }

      // Build indoor screen bundle now that we know which edges were found
      if (isIndoors) {
        const connectedRooms = new Set<number>([primaryScreenIndex]);
        for (const c of allConnections) {
          if (!c.isIntraRoom) connectedRooms.add(c.targetScreen);
        }
        const roomList = [...connectedRooms];

        // For multi-screen rooms, expand into virtual quadrant cells.
        // Shape determines the grid dimensions of the current room.
        const shape = roomLayout?.shape ?? '1x1';
        const roomGridCols = (shape === '2x2' || shape === '2x1') ? 2 : 1;
        const roomGridRows = (shape === '2x2' || shape === '1x2') ? 2 : 1;
        // Determine multi-screen room from layout info directly (not BFS transitions,
        // since BFS now floods the full grid without quadrant bounds).
        const hasIntraEdges = intraEdges.length > 0;

        // Get effective layout from dungeon map data (how many cells this room occupies)
        const mapPos = wasmGetDungeonMapPosition();
        const effLayout = mapPos?.found ? { width: mapPos.effectiveWidth, height: mapPos.effectiveHeight } : undefined;

        // Use effective layout from map data for grid dimensions when available,
        // fall back to quadrant-based shape otherwise
        const effCols = effLayout ? effLayout.width : (hasIntraEdges ? roomGridCols : 1);
        const effRows = effLayout ? effLayout.height : (hasIntraEdges ? roomGridRows : 1);

        setScreenBundle({
          name: screenName,
          screens: roomList,
          cols: Math.max(effCols, roomList.length > 1 ? 2 : 1),
          rows: Math.max(effRows, roomList.length > 1 ? 2 : 1),
          subNames: {}, screenNames: {},
          isMulti: (effLayout ? (effLayout.width > 1 || effLayout.height > 1) : hasIntraEdges) || roomList.length > 1,
          head: primaryScreenIndex,
          roomShape: hasIntraEdges ? shape : undefined,
          activeQuadrant: hasIntraEdges ? { x: roomLayout!.quadrantX, y: roomLayout!.quadrantY } : undefined,
          effectiveLayout: effLayout,
        });
      }

      setDynamicBlockerCount(responses.reduce((sum, x) => sum + (x.result.dynamicBlockerCells?.length ?? x.dynamicBlockers?.length ?? 0), 0));
      setResult(primaryResult);
      setConnections(allConnections);

      // Compute fall hole landing positions for indoor rooms
      const fallHoleSpawns: Array<{ gridRow: number; gridCol: number; entranceId: number }> = [];
      if (isIndoors) {
        const spawns = wasmGetEntranceSpawns();
        const rooms = wasmGetEntranceRooms();
        const holes = wasmGetFallHoles();
        if (spawns && rooms && holes) {
          const roomOriginX = (primaryScreenIndex % 16) * 512;
          const roomOriginY = Math.floor(primaryScreenIndex / 16) * 512;
          for (const h of holes) {
            if (rooms[h.entranceId] === primaryScreenIndex) {
              const spawn = spawns[h.entranceId];
              if (spawn) {
                // +1 col / +2 row: spawn is Link's sprite top-left; offset to center on hitbox (bottom 2×2)
                const gridCol = Math.floor((spawn.x - roomOriginX) / 8) + 1;
                const gridRow = Math.floor((spawn.y - roomOriginY) / 8) + 2;
                if (gridRow >= 0 && gridRow < 64 && gridCol >= 0 && gridCol < 64) {
                  fallHoleSpawns.push({ gridRow, gridCol, entranceId: h.entranceId });
                }
              }
            }
          }
        }
      }
      setFallHoleLandings(fallHoleSpawns);
      setRespawnEntIds(currentRespawnIds);

      overlayStore.setData(primaryResult, allConnections, fillResults, fallHoleSpawns, currentRespawnIds);
    } catch (e) { console.error(e); }
    finally {
      setRunning(false);
      if (pendingAutoSecondPassRef.current) {
        pendingAutoSecondPassRef.current = false;
        if (autoSecondPassTimerRef.current) clearTimeout(autoSecondPassTimerRef.current);
        autoSecondPassTimerRef.current = setTimeout(() => {
          handleRunRef.current?.();
        }, 120);
      }
    }
  }, [activeScreenIndex, isIndoors, overworldScreenIndex, running, equipment, roomIndex, variant, inventoryItems]);

  handleRunRef.current = handleRun;

  useEffect(() => () => {
    if (autoSecondPassTimerRef.current) clearTimeout(autoSecondPassTimerRef.current);
  }, []);

  // Auto-flood CLI flag: trigger initial flood fill once active screen is known
  const didAutoFloodInit = useRef(false);
  useEffect(() => {
    if (!window.api.autoFlood || didAutoFloodInit.current) return;
    if (activeScreenIndex === null || running) return;
    didAutoFloodInit.current = true;
    handleRunRef.current?.();
  }, [activeScreenIndex, running]);

  // Auto-trigger: detect screen/quadrant changes and fire handleRun
  useAutoFloodTrigger({
    autoRun,
    running,
    isIndoors,
    activeScreenIndex,
    debugTick,
    onTrigger: useCallback(() => { handleRunRef.current?.(); }, []),
  });

  // Auto-run flood fill when inventory/equipment changes (affects reachability)
  useEffect(() => {
    if (!autoRun || running) return;
    const key = `${equipment.sword},${equipment.gloves},${equipment.boots ? 1 : 0},${equipment.flippers ? 1 : 0},${inventoryItems[2]},${inventoryItems[11]}`;
    if (prevInventoryKeyRef.current !== null && prevInventoryKeyRef.current !== key) {
      handleRunRef.current?.();
    }
    prevInventoryKeyRef.current = key;
  }, [autoRun, running, equipment, inventoryItems]);

  // Toggle overlay
  const toggleOverlay = useCallback(() => {
    if (overlayStore.visible) overlayStore.setVisible(false);
    else if (result) overlayStore.setData(result, connections, renderResults, overlayStore.fallHoleSpawns, respawnEntIds);
  }, [result, connections, renderResults]);

  // Derived: classify connections as internal (between bundle screens) vs external
  // For indoor rooms, use `isIntraRoom` flag (set by getConnections for quadrant boundaries).
  // For overworld, use bundle membership (adjacent screens in a 2×2 big-screen group).
  const bundleScreenSet = useMemo(() => new Set(screenBundle?.screens ?? []), [screenBundle]);
  const sortConn = (a: ConnectionInfo, b: ConnectionInfo) => {
    const edgeOrder = { north: 0, south: 1, west: 2, east: 3 };
    const d = (edgeOrder[a.edge] ?? 0) - (edgeOrder[b.edge] ?? 0);
    if (d !== 0) return d;
    const sa = a.sourceScreen ?? 0, sb = b.sourceScreen ?? 0;
    if (sa !== sb) return sa - sb;
    return a.targetScreen - b.targetScreen;
  };
  const isInternalConn = useCallback((c: ConnectionInfo) => {
    if (isIndoors) return !!c.isIntraRoom;
    return bundleScreenSet.has(c.targetScreen);
  }, [isIndoors, bundleScreenSet]);
  const externalConnections = useMemo(() => connections.filter(c => !isInternalConn(c)).sort(sortConn), [connections, isInternalConn]);
  const internalConnections = useMemo(() => {
    // Deduplicate: A→east→B and B→west→A are the same border. Keep the spatially-correct one.
    // For intra-room edges, keep all of them (south+north are two sides of the same boundary).
    const internal = connections.filter(c => isInternalConn(c)).sort(sortConn);
    const intraRoom = internal.filter(c => c.isIntraRoom);
    const interScreen = internal.filter(c => !c.isIntraRoom);
    const bestByPair = new Map<string, ConnectionInfo>();
    for (const c of interScreen) {
      const pair = [c.sourceScreen ?? 0, c.targetScreen].sort((a, b) => a - b);
      const key = `${pair[0]}-${pair[1]}`;
      const existing = bestByPair.get(key);
      // Prefer east (left→right) and south (top→bottom) for spatial correctness
      if (!existing || c.edge === 'east' || c.edge === 'south') {
        bestByPair.set(key, c);
      }
    }
    return [...intraRoom, ...bestByPair.values()];
  }, [connections, isInternalConn]);

  // Entrance spawn data for showing starting layer per entrance
  const entranceSpawns = wasmGetEntranceSpawns();

  return {
    screenBundle, screenName, isIndoors, roomIndex, isDarkWorld, overworldScreenIndex, externalConnections, renderResults, linkDebug, respawnEntIds, palaceIndex, dungeonMapPos, roomLayoutInfo, whichEntrance, roomStartLayer, progressInfo, displayedVariant, dynamicBlockerCount, linkX, linkY, running, handleRun, result, toggleOverlay, overlayStore, autoRun, setAutoRun, reachableSum, totalTilesSum, entranceSum, internalConnections, fallHoleLandings, entranceSpawns,
  };
};

export { useNavigation };
