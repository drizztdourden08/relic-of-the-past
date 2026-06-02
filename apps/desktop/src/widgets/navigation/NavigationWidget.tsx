/**
 * NavigationWidgetContent — "Location & Navigation" widget.
 *
 * Shows current overworld location info + connections with review controls.
 * Triggers flood-fill analysis and drives the in-game overlay.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Icon } from '@iconify/react/offline';
import { useGameUIStore } from '../../stores/game-ui-store';
import { useNavigationOverlayStore } from '../../stores/navigation-overlay-store';
import { getEntranceIcon } from '../../lib/entrance-icons';
import { buildScreenBundle, floodFillScreen, getConnections } from '@shared/game/navigation';
import type { FloodFillOptions, QuadrantBounds } from '@shared/game/navigation';
import type { ScreenBundle, OverworldEntrance } from '@shared/game/navigation';
import { getScreenLookup, SCREEN_BY_ID } from '@shared/game/data/screens';
import { ALL_CONNECTIONS } from '@shared/game/data/connections';
import { wasmGetViewportInfo, wasmGetOverworldVariant, wasmGetProgressIndicator, wasmGetIndoorDualLayerGrids, wasmGetIndoorLayer0Grid, wasmGetLinkLayer, wasmGetStaircaseType, wasmGetIndoorUncleBlockers, wasmGetLiveSprites, wasmGetOverworldGuardSpawns, wasmBuildOverworldAttrGrid, wasmGetOverworldEntrances, wasmGetFallHoles, wasmGetExitScreenMap, wasmGetAreaHeads, wasmGetEntranceRooms, wasmGetEntranceSpawns, wasmGetRoomLayoutInfo, wasmGetDungeonMapPosition, wasmGetRoomExitDoors, wasmGetRoomStairInfo, wasmGetRoomWalkBoundaries, wasmGetToggleFloorPositions } from '../../lib/game';
import { getCompletedChecks } from '../../lib/game/tracker';
import type { OverworldVariantInfo } from '../../lib/game';
import type { TileAttrContext } from '@shared/game/navigation/tile-attrs';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import { useScreenDetection, useLinkDebugState, useAutoFloodTrigger } from './hooks';

/** Get overworld screen display name from screen index */
function getScreenDisplayName(screenIndex: number): string {
  return getScreenLookup().byOverworldScreen.get(screenIndex)?.name ?? `0x${screenIndex.toString(16).toUpperCase()}`;
}

/** Pre-built map: fromRegionId → array of destination screen IDs */
const connectionsByFrom = new Map<string, string[]>();
for (const conn of ALL_CONNECTIONS) {
  let list = connectionsByFrom.get(conn.from);
  if (!list) { list = []; connectionsByFrom.set(conn.from, list); }
  list.push(conn.to);
}

/**
 * Resolve display name for an entrance/connection destination.
 * Given the current screen ID and the target room's roomIndex,
 * finds the matching connection and returns the destination screen's name.
 */
function getConnectionDestinationName(currentScreenId: string, targetRoomId: number): string | null {
  const destinations = connectionsByFrom.get(currentScreenId);
  if (!destinations) return null;
  for (const toId of destinations) {
    const screen = SCREEN_BY_ID.get(toId);
    if (screen && screen.roomIndex === targetRoomId) {
      return screen.name;
    }
  }
  return null;
}

import type { FloodFillResult, ConnectionInfo } from '@shared/game/navigation';

// ─── Local helpers for direct orchestrator calls ─────────────────────────────

/** Convert flat Uint8Array (4096 bytes) to 64×64 number[][] grid */
function uint8ToGrid(raw: Uint8Array): number[][] {
  const grid: number[][] = new Array(64);
  for (let r = 0; r < 64; r++) {
    grid[r] = new Array(64);
    for (let c = 0; c < 64; c++) {
      grid[r][c] = raw[r * 64 + c];
    }
  }
  return grid;
}

/** Enrich raw wasm entrance data with gridRow/gridCol/roomId for orchestrator */
function enrichEntrances(): OverworldEntrance[] {
  const raw = wasmGetOverworldEntrances();
  const holes = wasmGetFallHoles();
  const rooms = wasmGetEntranceRooms();
  const heads = wasmGetAreaHeads();

  // For big screens (2×2 groups), entrances store the HEAD area and use 128×128 coordinates.
  // We need to resolve each entrance to its correct sub-screen with 64×64 local coordinates.
  const resolveToSubScreen = (area: number, bigRow: number, bigCol: number): { area: number; gridRow: number; gridCol: number } => {
    if (!heads) return { area, gridRow: bigRow, gridCol: bigCol };
    const head = heads[area];
    // If the entrance's area IS a head and it's a big screen group, resolve sub-screen
    if (head === area) {
      const isBig = heads.some((h, i) => h === area && i !== area);
      if (isBig && (bigRow >= 64 || bigCol >= 64)) {
        const headRow = (area >> 3) & 7;
        const headCol = area & 7;
        const subRow = bigRow >= 64 ? 1 : 0;
        const subCol = bigCol >= 64 ? 1 : 0;
        const subScreen = ((headRow + subRow) << 3) | (headCol + subCol);
        return { area: subScreen, gridRow: bigRow - subRow * 64, gridCol: bigCol - subCol * 64 };
      }
    }
    return { area, gridRow: bigRow, gridCol: bigCol };
  };

  const entrances: OverworldEntrance[] = raw.map(e => {
    const bigRow = (e.pos >> 7) * 2;
    const bigCol = ((e.pos & 0x7F) >> 1) * 2;
    const resolved = resolveToSubScreen(e.area, bigRow, bigCol);
    return {
      area: resolved.area,
      pos: e.pos,
      id: e.id,
      gridRow: resolved.gridRow,
      gridCol: resolved.gridCol,
      roomId: rooms?.[e.id] ?? 0,
    };
  });
  // Merge fall holes (pits that lead to rooms) — use id offset 200+ to avoid collision
  // Fall hole pos stores row offset by -8 relative to the actual overworld position; add 8 back.
  for (const h of holes) {
    const bigRow = ((h.pos >> 7) + 8) * 2;
    const bigCol = ((h.pos & 0x7F) >> 1) * 2;
    const resolved = resolveToSubScreen(h.area, bigRow, bigCol);
    entrances.push({
      area: resolved.area,
      pos: h.pos,
      id: 200 + h.entranceId,
      gridRow: resolved.gridRow,
      gridCol: resolved.gridCol,
      roomId: rooms?.[h.entranceId] ?? 0,
    });
  }
  return entrances;
}

/** Compute big-screen group from WASM area heads table */
function computeBigScreenGroup(screenIndex: number): number[] {
  const heads = wasmGetAreaHeads();
  if (!heads) return [screenIndex];
  const myHead = heads[screenIndex];
  if (myHead === undefined) return [screenIndex];
  const group: number[] = [];
  for (let i = 0; i < 64; i++) {
    if (heads[i] === myHead) group.push(i);
  }
  return group.length > 0 ? group : [screenIndex];
}

const EDGE_COLORS: Record<string, string> = {
  north: '#4488ff', south: '#44ff88', east: '#ff8844', west: '#bb44ff', entrance: '#ffcc44',
};

function getVisibleOverworldScreenIndices(vp: NonNullable<ReturnType<typeof wasmGetViewportInfo>>): number[] {
  const viewLeft = vp.cameraX - vp.extraLeftRight;
  const viewTop = vp.cameraY;
  const viewRight = viewLeft + vp.snesWidth - 1;
  const viewBottom = viewTop + vp.snesHeight - 1;

  const minCol = Math.max(0, Math.min(7, Math.floor(viewLeft / 512)));
  const maxCol = Math.max(0, Math.min(7, Math.floor(viewRight / 512)));
  const minRow = Math.max(0, Math.min(7, Math.floor(viewTop / 512)));
  const maxRow = Math.max(0, Math.min(7, Math.floor(viewBottom / 512)));

  const out: number[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      out.push((r << 3) | c);
    }
  }
  return out;
}

function NavigationWidgetContent() {
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

  return (
    <div style={S.root}>
      {/* ═══ 1. BUNDLE TITLE + SCREEN MAP ═══ */}
      <div style={S.section}>
        <div style={S.locName}>
          {screenBundle ? screenBundle.name : screenName}
          {screenBundle?.isMulti && <span style={{ fontSize: 9, color: '#888', marginLeft: 6 }}>({screenBundle.screens.length} {isIndoors ? 'rooms' : 'screens'})</span>}
        </div>
        <div style={S.meta}>
          {isIndoors ? `room-${roomIndex.toString(16).padStart(3, '0')}` : `${isDarkWorld ? 'dw' : 'lw'}-${overworldScreenIndex.toString(16).padStart(2, '0')}`} · {isIndoors ? 'INDOOR' : (isDarkWorld ? 'DW' : 'LW')}
          {!isIndoors && ` · R${(overworldScreenIndex >> 3) & 7} C${overworldScreenIndex & 7}`}
        </div>

        {/* Screen map with edge connection indicators */}
        {screenBundle && (
          <ScreenMapWithConnections bundle={screenBundle} connections={externalConnections} renderResults={renderResults} linkScreenIndex={linkDebug?.liveScreenIndex ?? null} linkPos={linkDebug ? { screen: linkDebug.liveScreenIndex, row: linkDebug.tileMinRow, col: linkDebug.tileMinCol } : null} respawnEntIds={respawnEntIds} />
        )}
      </div>

      {/* ═══ 1a. GAME STATE ═══ */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Game State</div>
        <div style={S.infoBox}>
          <DescRow label="Mode" desc="Whether Link is currently indoors (dungeon/cave/house) or outdoors on the overworld.">
            <span style={{ color: isIndoors ? '#fc6' : '#8c8' }}>{isIndoors ? 'Indoor' : 'Outdoor'}</span>
          </DescRow>
          {isIndoors ? (
            <>
              <DescRow label="Type" desc="The type of interior: Dungeon (palace index 0–13, has maps/keys/bosses), or Cave/House (palace 0xFF, standalone interiors with no dungeon logic).">
                <span style={{ color: palaceIndex === 0xFF ? '#8c8' : '#f8a' }}>{palaceIndex === 0xFF ? 'Cave / House' : 'Dungeon'}</span>
              </DescRow>
              <DescRow label="Room" desc="The current room ID in the indoor tilemap (0x0000–0x0127). Each indoor room is a 512×512 pixel area.">
                <span>0x{roomIndex.toString(16).toUpperCase().padStart(4, '0')}</span>
              </DescRow>
              <DescRow label="Grid Pos" desc="The room's position in the dungeon's 5×5 map grid for the current floor (from the dungeon map layout data). 1-based row,col. Falls back to absolute room grid (16×16) for caves/houses.">
                {dungeonMapPos?.found ? (
                  <span style={{ color: '#aac' }}>({dungeonMapPos.mapRow + 1}, {dungeonMapPos.mapCol + 1})</span>
                ) : (
                  <span style={{ color: '#666' }}>({(roomIndex >> 4) + 1}, {(roomIndex & 0xF) + 1})</span>
                )}
              </DescRow>
              {dungeonMapPos && (
                <DescRow label="Floor" desc="The current dungeon floor. Derived from dung_cur_floor: 0=1F, 1=2F, 0xFF=B1, 0xFE=B2, etc. The range shows all floors in this dungeon from highest to lowest.">
                  <span style={{ color: '#fc6' }}>{dungeonMapPos.floorLabel}</span>
                  <span style={{ color: '#888', marginLeft: 4, fontSize: 10 }}>[{dungeonMapPos.numAboveFloors > 0 ? `${dungeonMapPos.numAboveFloors}F` : ''}{dungeonMapPos.numAboveFloors > 0 && dungeonMapPos.numBasementFloors > 0 ? ' … ' : ''}{dungeonMapPos.numBasementFloors > 0 ? `B${dungeonMapPos.numBasementFloors}` : ''}]</span>
                </DescRow>
              )}
              {roomLayoutInfo && (() => {
                // Compute effective viewport size: base shape expanded by fullsize flags
                const baseW = (roomLayoutInfo.shape === '2x2' || roomLayoutInfo.shape === '2x1') ? 2 : 1;
                const baseH = (roomLayoutInfo.shape === '2x2' || roomLayoutInfo.shape === '1x2') ? 2 : 1;
                const effW = Math.max(baseW, roomLayoutInfo.quadrantFullsizeX > 0 ? 2 : baseW);
                const effH = Math.max(baseH, roomLayoutInfo.quadrantFullsizeY > 0 ? 2 : baseH);
                const effectiveShape = `${effW}×${effH}`;
                const hasScrollBoundaries = roomLayoutInfo.intraEdges.length > 0;
                return (
                  <DescRow label="Viewport" desc="Camera viewport of this room (width × height in screens). Based on the room's quadrant allocation + fullsize flags. 'open' = no internal camera scroll boundaries. 'scroll' = camera scrolls between quadrants.">
                    <span style={{ color: '#caf' }}>{effectiveShape}</span>
                    <span style={{ color: hasScrollBoundaries ? '#f84' : '#8c8', marginLeft: 4, fontSize: 10 }}>{hasScrollBoundaries ? 'scroll' : 'open'}</span>
                    <span style={{ color: '#666', marginLeft: 4, fontSize: 10 }}>raw={roomLayoutInfo.shape} idx={roomLayoutInfo.layout}</span>
                  </DescRow>
                );
              })()}
              {dungeonMapPos?.found && (
                <DescRow label="Effective Layout" desc="The room's actual footprint on the dungeon map grid, determined by counting how many cells this room occupies in the 5×5 map layout. This is what the in-game MAP screen shows.">
                  <span style={{ color: '#4fc' }}>{dungeonMapPos.effectiveLayout}</span>
                </DescRow>
              )}
              <DescRow label="Last Entrance" desc="The entrance ID Link last used to enter from the overworld. Determines spawn position, starting layer, and palace assignment. Does NOT update for indoor-to-indoor transitions.">
                <span style={{ color: whichEntrance ? '#7cf' : '#666' }}>{whichEntrance ? `0x${whichEntrance.toString(16).toUpperCase().padStart(2, '0')} (${whichEntrance})` : '—'}</span>
              </DescRow>
              <DescRow label="Palace Index" desc="Identifies which dungeon Link is in (0–13). 0xFF = cave/house (non-dungeon interior). Used for dungeon-specific logic like boss keys and maps.">
                <span>{palaceIndex === 0xFF ? 'Cave/House' : `${palaceIndex >> 1} (0x${palaceIndex.toString(16).toUpperCase()})`}</span>
              </DescRow>
              <DescRow label="Starting Layer" desc="The layer Link was on when this room was first entered. Captured at room load. In rooms with staircase type 2 (Blocked), Link stays locked to this layer. Layer toggles are caused by door type 22 (kDoorType_PlayerBgChange).">
                {roomStartLayer !== null ? (
                  <span style={{ color: roomStartLayer === 0 ? '#7ff' : '#ff7' }}>
                    {roomStartLayer === 0 ? 'Upper (BG2)' : 'Lower (BG1)'}
                  </span>
                ) : (
                  <span style={{ color: '#666' }}>—</span>
                )}
              </DescRow>
            </>
          ) : (
            <>
              <DescRow label="Screen" desc="The overworld screen index (0x00–0x3F). Grid position: row = upper bits, col = lower bits. Each screen is 512×512 pixels.">
                <span>0x{overworldScreenIndex.toString(16).toUpperCase().padStart(2, '0')} (R{(overworldScreenIndex >> 3) & 7} C{overworldScreenIndex & 7})</span>
              </DescRow>
              <DescRow label="World" desc="Light World or Dark World. The two 8×8 overworld grids occupy the same coordinate space but are separate maps.">
                <span style={{ color: isDarkWorld ? '#c8a' : '#8c8' }}>{isDarkWorld ? 'Dark World' : 'Light World'}</span>
              </DescRow>
            </>
          )}
          {progressInfo && (
            <DescRow label="Phase" desc="The game's progress indicator byte. Controls NPC dialogue, event triggers, and overworld tile patches. Advances as you complete key objectives.">
              <span style={{ color: '#fc6' }}>{progressInfo.label}</span>
              <span style={{ color: '#888', marginLeft: 4, fontSize: 10 }}>0x{progressInfo.tier.toString(16).padStart(2, '0')}</span>
            </DescRow>
          )}
          {displayedVariant && (
            <>
              <DescRow label="Tile Patch" desc="Whether this screen has an active event overlay that modifies walkable tiles (e.g. rocks removed after an event).">
                {displayedVariant.eventOverlayActive
                  ? <span style={{ color: '#4f8' }}>active</span>
                  : <span style={{ color: '#666' }}>none</span>}
              </DescRow>
              <DescRow label="Flags" desc="Screen-specific event flags from SRAM. Track permanent world changes like opened chests, pulled levers, and destroyed barriers.">
                <span style={{ color: '#aac' }}>0x{displayedVariant.screenEventFlags.toString(16).padStart(2, '0')}</span>
              </DescRow>
              <DescRow label="NPC Blockers" desc="Number of sprites currently blocking BFS pathfinding (tutorial guards, barriers). These physically prevent Link from passing.">
                <span style={{ color: dynamicBlockerCount > 0 ? '#fc6' : '#666' }}>{dynamicBlockerCount}</span>
              </DescRow>
            </>
          )}
        </div>
      </div>

      {/* ═══ 2. LINK STATE ═══ */}
      {linkDebug && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Link State</div>
          <div style={S.infoBox}>
            <DescRow label="Link Pos" desc="Link's absolute world position in pixels. Indoor: relative to room origin. Outdoor: relative to overworld origin (0,0 = top-left of screen 0x00).">
              <span style={{ color: '#aac' }}>{linkX}, {linkY}</span>
            </DescRow>
            {!isIndoors && (
              <DescRow label="World Pos" desc="Link's full world coordinates in pixels (same as Link Pos for outdoor). Used to calculate which overworld screen Link is actually standing on.">
                <span style={{ color: '#7f7' }}>({linkDebug.linkX}, {linkDebug.linkY})</span>
              </DescRow>
            )}
            <DescRow label="Relative" desc="Link's position relative to the current 512×512 screen/room origin in pixels.">
              <span style={{ color: '#7f7' }}>({linkDebug.relX}, {linkDebug.relY})</span>
            </DescRow>
            <DescRow label="Sub-tile" desc="The 8×8 tile range Link's hitbox currently overlaps. Row and column are in tile coordinates (0–63 per screen).">
              <span style={{ color: '#7f7' }}>r{linkDebug.tileMinRow}–{linkDebug.tileMaxRow} c{linkDebug.tileMinCol}–{linkDebug.tileMaxCol}</span>
            </DescRow>
            <DescRow label="Map16" desc="The 16×16 metatile coordinate Link occupies. Map16 tiles are the collision unit — each contains four 8×8 sub-tiles.">
              <span style={{ color: '#7f7' }}>({linkDebug.map16Row}, {linkDebug.map16Col})</span>
            </DescRow>
            {!isIndoors && (
              <DescRow label="Live Screen" desc="The overworld screen Link is physically standing on right now (may differ from the 'Screen' in Game State during scrolling transitions).">
                <span style={{ color: '#7f7' }}>0x{linkDebug.liveScreenIndex.toString(16).toUpperCase()}</span>
              </DescRow>
            )}
            {linkDebug.linkLayer !== null && (
              <DescRow label="Layer" desc="Link's current collision layer (link_is_on_lower_level). 0=Upper/BG2 (drawn behind BG1), 1=Lower/BG1 (drawn in front). Can change via staircases if not blocked.">
                <span style={{ color: linkDebug.linkLayer === 0 ? '#7ff' : '#ff7' }}>
                  {linkDebug.linkLayer === 0 ? '0 (upper/BG2)' : '1 (lower/BG1)'}
                </span>
              </DescRow>
            )}
            {linkDebug.collisionType !== null && linkDebug.collisionType >= 0 && (
              <DescRow label="Collision" desc="Room collision type (room_is_dark byte bits). 0=single layer, 1=both layers active, 2=both+scroll, 3=moving floor, 4=water/swim. Determines which BG layers have collision.">
                <span style={{ color: '#f9a' }}>
                  {linkDebug.collisionType} ({['One','Both','Both+Scroll','MovFloor','Swim'][linkDebug.collisionType] ?? '?'})
                </span>
              </DescRow>
            )}
            {linkDebug.staircaseType !== null && linkDebug.staircaseType >= 0 && (
              <DescRow label="Staircase" desc="Controls layer-change behavior (kind_of_in_room_staircase). 0=intra-room stairs (layer+room shift), 1=layer stairs (changes allowed), 2=pseudo/water stairs (ALL layer changes BLOCKED).">
                <span style={{ color: linkDebug.staircaseType === 2 ? '#f55' : '#5f5' }}>
                  {linkDebug.staircaseType} ({['IntraRoom','Layer','Blocked'][linkDebug.staircaseType] ?? '?'})
                </span>
              </DescRow>
            )}
          </div>
        </div>
      )}

      {/* ═══ 4. FUNCTIONS ═══ */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Functions</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <button data-testid="nav-flood-btn" style={{ ...S.btn, ...(running ? S.btnDisabled : {}) }} onClick={handleRun} disabled={running}>
            {running ? '⏳' : '▶'} Flood Fill
          </button>
          <button style={{ ...S.btn, ...(result ? {} : S.btnDisabled) }} onClick={toggleOverlay} disabled={!result}>
            {overlayStore.visible ? '👁 Hide' : '👁 Show'}
          </button>
          <button
            style={{ ...S.btn, ...(autoRun ? S.btnActive : {}) }}
            onClick={() => { setAutoRun(a => !a); if (!autoRun && !running) handleRun(); }}
          >
            ⟳ Auto
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
          <TileRecorderBtn attrGrid={result?.attrGrid ?? null} overworldScreenIndex={overworldScreenIndex} />
          <PathCopyBtn />
        </div>
        {/* Summary stats */}
        {result && (
          <div style={{ ...S.infoBox, marginTop: 4 }}>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Reachable</span>
              <span>{reachableSum}/{totalTilesSum} ({totalTilesSum > 0 ? (reachableSum / totalTilesSum * 100).toFixed(0) : '0'}%)</span>
            </div>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Entrances</span>
              <span>{entranceSum}</span>
            </div>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Edges</span>
              <span>{externalConnections.length}{internalConnections.length > 0 ? ` + ${internalConnections.filter(c => !c.isIntraRoom || c.edge === 'south' || c.edge === 'east').length} int` : ''}</span>
            </div>
          </div>
        )}
      </div>

      {/* ═══ 5. CONNECTIONS (unified) ═══ */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Connections</div>

        {/* ─── Entrances sub-section ─── */}
        <div style={{ ...S.meta, color: '#aaa', marginBottom: 4, marginTop: 2, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Entrances ({entranceSum})</div>
        {renderResults.some(r => r.entrances.some(e => r.transitions.some(t => t.entranceIdx === e.id))) ? (
          renderResults.map(r => {
            const reachableEntrances = r.entrances.filter(e => r.transitions.some(t => t.entranceIdx === e.id));
            if (reachableEntrances.length === 0) return null;
            const scrLabel = screenBundle?.isMulti
              ? (screenBundle.screenNames[r.screenIndex] ?? `0x${r.screenIndex.toString(16).toUpperCase()}`)
              : null;
            const screenNodeId = `${isDarkWorld ? 'dw' : 'lw'}-${r.screenIndex.toString(16).padStart(2, '0')}`;
            return (
              <div key={`ent-${r.screenIndex}`}>
                {scrLabel && <div style={{ ...S.meta, color: '#8cf', marginTop: 2 }}>{scrLabel}</div>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {reachableEntrances.map(ent => {
                  const t = r.transitions.find(t => t.entranceIdx === ent.id);
                  const isRespawn = respawnEntIds.has(ent.id);
                  const { icon: iconData, color: iconColor } = getEntranceIcon(ent.id, ent.roomId, roomIndex, isIndoors, respawnEntIds);
                  const isSyntheticIndoor = ent.id >= 1000 && isIndoors;
                  const isIndoorOverworldEntrance = isIndoors && ent.id < 1000;
                  let displayName: string;
                  if (isRespawn) {
                    displayName = 'Respawn Point';
                  } else if (isSyntheticIndoor) {
                    displayName = `Room 0x${ent.roomId.toString(16).toUpperCase()}`;
                  } else if (isIndoorOverworldEntrance) {
                    displayName = ent.roomId >= 0
                      ? (getScreenDisplayName(ent.roomId))
                      : 'Overworld';
                  } else {
                    displayName = getConnectionDestinationName(screenNodeId, ent.roomId)
                      ?? `Room 0x${ent.roomId.toString(16).toUpperCase()}`;
                  }
                  return (
                    <div key={`entrance-${ent.id}`} style={S.card}>
                      <div style={S.cardGraphic}>
                        <Icon icon={iconData} width={28} height={28} style={{ color: iconColor }} />
                      </div>
                      <span style={S.cardTitle}>{displayName}</span>
                      <span style={S.cardSub}>#{ent.id}</span>
                      {entranceSpawns && ent.id < entranceSpawns.length && (
                        <span style={{ fontSize: 8, color: entranceSpawns[ent.id].startingLayer === 0 ? '#7ff' : '#ff7', marginTop: 1 }}>
                          {entranceSpawns[ent.id].startingLayer === 0 ? '▲ Upper' : '▼ Lower'}
                        </span>
                      )}
                      {t?.requirements && t.requirements.length > 0 && (
                        <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>{t.requirements.map(r => <ReqIcon key={r} req={r} />)}</div>
                      )}
                    </div>
                  );
                })}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ ...S.meta, color: '#666' }}>None</div>
        )}

        {/* ─── Edges sub-section ─── */}
        <div style={{ ...S.meta, color: '#aaa', marginBottom: 4, marginTop: 8, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Edges ({externalConnections.length})</div>
        {externalConnections.length > 0 ? (
          externalConnections.map(conn => {
            const connKey = `${conn.edge}-${conn.sourceScreen?.toString(16)}-${conn.targetScreen.toString(16)}-${conn.positions[0]}`;
            let targetName: string;
            if (isIndoors) {
              targetName = `Room 0x${conn.targetScreen.toString(16).toUpperCase().padStart(2, '0')}`;
            } else {
              const targetNodeId = `${isDarkWorld ? 'dw' : 'lw'}-${conn.targetScreen.toString(16).padStart(2, '0')}`;
              targetName = SCREEN_BY_ID.get(targetNodeId)?.name ?? `0x${conn.targetScreen.toString(16).toUpperCase()}`;
            }
            const fromLabel = screenBundle?.isMulti && conn.sourceScreen != null
              ? ` (${screenBundle.subNames[conn.sourceScreen] ?? ''})`
              : '';
            const posAxis = conn.edge === 'north' || conn.edge === 'south' ? 'c' : 'r';
            const posRange = conn.positions.length > 0
              ? `${posAxis}${conn.positions[0]}-${conn.positions[conn.positions.length - 1]}`
              : '';
            // Compute target layer if this is a toggle door (XOR current layer)
            const currentLayer = linkDebug?.linkLayer;
            const targetLayerLabel = conn.layerToggle && currentLayer !== null
              ? (currentLayer === 0 ? '→ Lower' : '→ Upper')
              : null;
            return (
              <div key={connKey} style={S.connCard}>
                <div style={S.connHeader}>
                  <EdgeArrowSvg edge={conn.edge} size={16} />
                  <span style={S.connTitle}>{targetName}{fromLabel}</span>
                  <span style={S.dimBadge}>{posRange}</span>
                  <span style={S.dimBadge}>{conn.freeTileCount}{conn.itemTileCount > 0 ? `+${conn.itemTileCount}` : ''}</span>
                </div>
                {isIndoors && (
                  <div style={{ fontSize: 9, marginTop: 2, color: conn.layerToggle ? '#f8a' : '#6a8' }}>
                    {conn.layerToggle
                      ? <>▲▼ Layer Toggle {targetLayerLabel && <span style={{ color: targetLayerLabel.includes('Lower') ? '#ff7' : '#7ff' }}>{targetLayerLabel}</span>}</>
                      : <>═ No Layer Change</>}
                  </div>
                )}
                {conn.requirements.length > 0 && (
                  <div style={S.meta}>{conn.requirements.map(r => <ReqIcon key={r} req={r} />)}</div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ ...S.meta, color: '#666' }}>None</div>
        )}

        {/* ─── Internal Edges ─── */}
        {internalConnections.length > 0 && (
          <>
            {(() => {
              // Group intra-room connections into boundary pairs (south↔north, east↔west).
              // Each contiguous run on one side matches a run on the opposite side.
              const opposites: Record<string, string> = { north: 'south', south: 'north', east: 'west', west: 'east' };
              // Pick one side per axis (prefer south/east as "from")
              const fromEdges = internalConnections.filter(c =>
                c.isIntraRoom ? (c.edge === 'south' || c.edge === 'east') : true
              );
              // For overworld inter-screen internals, keep as-is
              const interScreen = internalConnections.filter(c => !c.isIntraRoom);
              const intraFrom = fromEdges.filter(c => c.isIntraRoom);

              const cards: { conn: ConnectionInfo; paired: ConnectionInfo | undefined }[] = [];
              for (const conn of intraFrom) {
                // Find the matching opposite run (same positions overlap)
                const opp = internalConnections.find(c =>
                  c.edge === opposites[conn.edge] && c.isIntraRoom &&
                  c.positions[0] === conn.positions[0]
                );
                cards.push({ conn, paired: opp });
              }
              // Add inter-screen internals as unpaired
              for (const conn of interScreen) {
                cards.push({ conn, paired: undefined });
              }

              const count = cards.length;
              return (
                <>
                  <div style={{ ...S.meta, color: '#aaa', marginBottom: 4, marginTop: 8, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Internal ({count})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                    {cards.map(({ conn, paired }, i) => {
                      if (screenBundle?.isMulti && !conn.isIntraRoom) {
                        const fromName = screenBundle.subNames[conn.sourceScreen!] ?? '?';
                        const toName = screenBundle.subNames[conn.targetScreen] ?? '?';
                        return (
                          <div key={`int-${i}`} style={S.card}>
                            <div style={S.cardGraphic}>
                              <InternalEdgeSvg edge={conn.edge} fromName={fromName} toName={toName} />
                            </div>
                            <span style={{ fontSize: 8, color: conn.layerToggle ? '#f8a' : '#6a8', marginTop: 2 }}>
                              {conn.layerToggle ? '▲▼ Toggle' : '═ Same'}
                            </span>
                          </div>
                        );
                      }
                      const fromCount = String(conn.freeTileCount);
                      const toCount = String(paired?.freeTileCount ?? conn.freeTileCount);
                      return (
                        <div key={`int-${i}`} style={S.card}>
                          <div style={S.cardGraphic}>
                            <InternalEdgeSvg edge={conn.edge} fromName={fromCount} toName={toCount} />
                          </div>
                          <span style={{ fontSize: 8, color: '#6a8', marginTop: 2 }}>
                            ═ Same
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </>
        )}

        {/* ─── Fall Hole Landings ─── */}
        {fallHoleLandings.length > 0 && (
          <>
            <div style={{ ...S.meta, color: '#aaa', marginBottom: 4, marginTop: 8, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Fall Holes ({fallHoleLandings.length})</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {fallHoleLandings.map((fh, i) => (
                <div key={`fh-${i}`} style={S.card}>
                  <div style={{ ...S.cardGraphic, background: 'repeating-linear-gradient(45deg, #ffcc44 0px, #ffcc44 2px, transparent 2px, transparent 4px)', borderRadius: 4 }}>
                    <span style={{ fontSize: 18 }}>⬇</span>
                  </div>
                  <span style={S.cardTitle}>Landing Zone</span>
                  <span style={S.cardSub}>r{fh.gridRow} c{fh.gridCol}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── EdgeArrowSvg ──────────────────────────────────────────────────────

function EdgeArrowSvg({ edge, size }: { edge: string; size: number }) {
  const color = EDGE_COLORS[edge] ?? '#888';
  // Filled arrow pointing in the direction of travel
  const paths: Record<string, string> = {
    north: 'M8 14 L8 4 M4 7 L8 3 L12 7',
    south: 'M8 2 L8 12 M4 9 L8 13 L12 9',
    west:  'M14 8 L4 8 M7 4 L3 8 L7 12',
    east:  'M2 8 L12 8 M9 4 L13 8 L9 12',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
      <path d={paths[edge] ?? paths.east} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ─── InternalEdgeDiamond ───────────────────────────────────────────────

type DiamondPos = 'top' | 'bottom' | 'left' | 'right';

function getEdgeDiamondPos(conn: ConnectionInfo, bundle: ScreenBundle): DiamondPos {
  // Determine grid position of source screen within the bundle
  const idx = bundle.screens.indexOf(conn.sourceScreen!);
  const col = idx % bundle.cols;
  const row = Math.floor(idx / bundle.cols);

  if (conn.edge === 'east') {
    // Horizontal border: top row → top, bottom row → bottom
    return row === 0 ? 'top' : 'bottom';
  } else {
    // Vertical border (south): left col → left, right col → right
    return col === 0 ? 'left' : 'right';
  }
}

function InternalEdgeDiamond({ connections, screenBundle }: { connections: ConnectionInfo[]; screenBundle: ScreenBundle }) {
  const slots: Record<DiamondPos, ConnectionInfo | null> = { top: null, bottom: null, left: null, right: null };
  for (const conn of connections) {
    const pos = getEdgeDiamondPos(conn, screenBundle);
    slots[pos] = conn;
  }

  const renderCard = (conn: ConnectionInfo | null) => {
    if (!conn) return <div style={{ ...S.card, visibility: 'hidden' }} />;
    const fromName = screenBundle.subNames[conn.sourceScreen!] ?? '?';
    const toName = screenBundle.subNames[conn.targetScreen] ?? '?';
    return (
      <div style={S.card}>
        <div style={S.cardGraphic}>
          <InternalEdgeSvg edge={conn.edge} fromName={fromName} toName={toName} />
        </div>
        <span style={S.cardSub}>{conn.freeTileCount}{conn.itemTileCount > 0 ? `+${conn.itemTileCount}` : ''}</span>
        <span style={{ fontSize: 8, color: conn.layerToggle ? '#f8a' : '#6a8', marginTop: 2 }}>
          {conn.layerToggle ? '▲▼ Toggle' : '═ Same'}
        </span>
        {conn.requirements.length > 0 && (
          <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>{conn.requirements.map(r => <ReqIcon key={r} req={r} />)}</div>
        )}
      </div>
    );
  };

  return (
    <div style={S.diamond}>
      {(slots.top) && <div style={S.diamondRow}>{renderCard(slots.top)}</div>}
      <div style={S.diamondMid}>
        {renderCard(slots.left)}
        {renderCard(slots.right)}
      </div>
      {(slots.bottom) && <div style={S.diamondRow}>{renderCard(slots.bottom)}</div>}
    </div>
  );
}

// ─── InternalEdgeSvg ───────────────────────────────────────────────────

function InternalEdgeSvg({ edge, fromName, toName }: { edge: string; fromName: string; toName: string }) {
  const fromColor = EDGE_COLORS[edge] ?? '#888';
  const opposites: Record<string, string> = { north: 'south', south: 'north', east: 'west', west: 'east' };
  const toColor = EDGE_COLORS[opposites[edge] ?? 'south'] ?? '#888';
  const isVertical = edge === 'north' || edge === 'south';

  // Square cells with flat inner edge, line overflows beyond squares
  const SQ = 20; // square size
  const LINE_OVERFLOW = 3; // how much line extends beyond squares

  if (isVertical) {
    // Stacked: [from] on top, line, [to] below
    const W = SQ + 2; // svg width (square + margins)
    const H = SQ * 2 + 2; // two squares touching, line between
    return (
      <svg width={W * 3} height={H} viewBox={`0 0 ${W * 3} ${H}`} style={{ flexShrink: 0 }}>
        {/* From square: rounded top corners, flat bottom */}
        <rect x={W} y="0" width={SQ} height={SQ} rx="3" ry="3" fill={fromColor} opacity="0.9" />
        <rect x={W} y={SQ - 3} width={SQ} height="3" fill={fromColor} opacity="0.9" />
        <text x={W + SQ / 2} y={SQ / 2 + 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#000">{fromName}</text>
        {/* Separator line — overflows horizontally */}
        <line x1={W - LINE_OVERFLOW} y1={SQ} x2={W + SQ + LINE_OVERFLOW} y2={SQ} stroke="#999" strokeWidth="2" />
        {/* To square: flat top, rounded bottom corners */}
        <rect x={W} y={SQ + 2} width={SQ} height={SQ} rx="3" ry="3" fill={toColor} opacity="0.9" />
        <rect x={W} y={SQ + 2} width={SQ} height="3" fill={toColor} opacity="0.9" />
        <text x={W + SQ / 2} y={SQ + 2 + SQ / 2 + 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#000">{toName}</text>
      </svg>
    );
  } else {
    // Side by side: [from] | [to]
    const W = SQ * 2 + 2;
    const H = SQ + LINE_OVERFLOW * 2;
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ flexShrink: 0 }}>
        {/* From square: rounded left corners, flat right edge */}
        <rect x="0" y={LINE_OVERFLOW} width={SQ} height={SQ} rx="3" ry="3" fill={fromColor} opacity="0.9" />
        <rect x={SQ - 3} y={LINE_OVERFLOW} width="3" height={SQ} fill={fromColor} opacity="0.9" />
        <text x={SQ / 2} y={LINE_OVERFLOW + SQ / 2 + 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#000">{fromName}</text>
        {/* Separator line — overflows vertically */}
        <line x1={SQ} y1="0" x2={SQ} y2={H} stroke="#999" strokeWidth="2" />
        {/* To square: flat left edge, rounded right corners */}
        <rect x={SQ + 2} y={LINE_OVERFLOW} width={SQ} height={SQ} rx="3" ry="3" fill={toColor} opacity="0.9" />
        <rect x={SQ + 2} y={LINE_OVERFLOW} width="3" height={SQ} fill={toColor} opacity="0.9" />
        <text x={SQ + 2 + SQ / 2} y={LINE_OVERFLOW + SQ / 2 + 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#000">{toName}</text>
      </svg>
    );
  }
}

// ─── ReqIcon ───────────────────────────────────────────────────────────

const REQ_ICONS: Record<string, { icon: string; color: string }> = {
  flippers: { icon: '🏊', color: '#48f' },
  hammer: { icon: '🔨', color: '#fa4' },
  boots: { icon: '👢', color: '#c84' },
  glove: { icon: '🧤', color: '#a8f' },
  hookshot: { icon: '🪝', color: '#8af' },
  bomb: { icon: '💣', color: '#f44' },
  firerod: { icon: '🔥', color: '#f84' },
  icerod: { icon: '❄️', color: '#4cf' },
  lamp: { icon: '🔦', color: '#fc4' },
  mirror: { icon: '🪞', color: '#c8f' },
  sword: { icon: '⚔️', color: '#aaf' },
  bow: { icon: '🏹', color: '#8c4' },
};

function ReqIcon({ req }: { req: string }) {
  const info = REQ_ICONS[req];
  if (info) {
    return <span title={req} style={{ fontSize: 12, marginRight: 2 }}>{info.icon}</span>;
  }
  return <span style={{ fontSize: 10, color: '#fc6', marginRight: 4, background: 'rgba(255,200,0,0.12)', padding: '0 3px', borderRadius: 2 }}>{req}</span>;
}

// ─── TileRecorderBtn (compact) ─────────────────────────────────────────

function TileRecorderBtn({ attrGrid, overworldScreenIndex }: { attrGrid: number[][] | null; overworldScreenIndex: number }) {
  const [recording, setRecording] = useState(false);
  const [tiles, setTiles] = useState<Array<{ row: number; col: number; attr: number }>>([]);
  const lastTile = useRef<string>('');
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!recording || !attrGrid) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    const poll = () => {
      const vp = wasmGetViewportInfo();
      if (vp && vp.locationModule === 9) {
        const screenWorldX = (overworldScreenIndex & 7) * 512;
        const screenWorldY = (((overworldScreenIndex >> 3) & 7)) * 512;
        const tileCol = Math.floor((vp.linkX - screenWorldX) / 8);
        const tileRow = Math.floor((vp.linkY - screenWorldY) / 8);
        if (tileRow >= 0 && tileRow < 64 && tileCol >= 0 && tileCol < 64) {
          const key = `${tileRow},${tileCol}`;
          if (key !== lastTile.current) {
            lastTile.current = key;
            setTiles(prev => [...prev, { row: tileRow, col: tileCol, attr: attrGrid[tileRow][tileCol] }]);
          }
        }
      }
      rafRef.current = requestAnimationFrame(poll);
    };
    rafRef.current = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafRef.current);
  }, [recording, attrGrid, overworldScreenIndex]);

  const toggle = () => {
    if (recording) setRecording(false);
    else { setTiles([]); lastTile.current = ''; setRecording(true); }
  };

  return (
    <>
      <button style={{ ...S.btn, ...(attrGrid ? {} : S.btnDisabled) }} onClick={toggle} disabled={!attrGrid}>
        {recording ? '⏹ Rec' : '⏺ Rec'}
      </button>
      {tiles.length > 0 && !recording && (
        <button style={S.btn} onClick={() => navigator.clipboard.writeText(tiles.map(t => `[${t.row},${t.col}] 0x${t.attr.toString(16).padStart(2, '0')}`).join('\n'))}>
          📋 Tiles
        </button>
      )}
    </>
  );
}

// ─── PathCopyBtn ───────────────────────────────────────────────────────

function PathCopyBtn() {
  const lockedPath = useNavigationOverlayStore(s => s.lockedPath);
  if (!lockedPath || lockedPath.length === 0) {
    return <button style={{ ...S.btn, ...S.btnDisabled }} disabled>📋 Path</button>;
  }
  return (
    <button style={S.btn} onClick={() => navigator.clipboard.writeText(lockedPath.map((t, i) => `${i}: [${t.row},${t.col}] 0x${t.attr.toString(16).padStart(2, '0')}`).join('\n'))}>
      📋 Path ({lockedPath.length})
    </button>
  );
}

// ─── ScreenMapWithConnections ──────────────────────────────────────────

function ReachabilityCanvas({ reachable, size, bounds, tileLayer }: { reachable: number[][]; size: number; bounds?: { minRow: number; maxRow: number; minCol: number; maxCol: number }; tileLayer?: (0 | 1 | 2)[][] }) {
  const ref = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const r0 = bounds?.minRow ?? 0, r1 = bounds?.maxRow ?? 63;
    const c0 = bounds?.minCol ?? 0, c1 = bounds?.maxCol ?? 63;
    const rows = r1 - r0 + 1, cols = c1 - c0 + 1;
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(cols, rows);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const state = reachable[r]?.[c] ?? 0;
        const off = ((r - r0) * cols + (c - c0)) * 4;
        if (state === 1) {
          const layer = tileLayer?.[r]?.[c];
          if (layer === 0) {
            // Upper layer (ABOVE) — brighter
            img.data[off] = 105; img.data[off + 1] = 105; img.data[off + 2] = 105; img.data[off + 3] = 255;
          } else if (layer === 1) {
            // Lower layer (GROUND) — darker
            img.data[off] = 65; img.data[off + 1] = 65; img.data[off + 2] = 65; img.data[off + 3] = 255;
          } else {
            // Both layers or no layer info
            img.data[off] = 90; img.data[off + 1] = 90; img.data[off + 2] = 90; img.data[off + 3] = 255;
          }
        } else if (state >= 2) {
          img.data[off] = 50; img.data[off + 1] = 50; img.data[off + 2] = 50; img.data[off + 3] = 255;
        } else {
          img.data[off] = 18; img.data[off + 1] = 18; img.data[off + 2] = 18; img.data[off + 3] = 255;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [reachable, bounds, tileLayer]);

  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 3, imageRendering: 'pixelated' }} />;
}

function ScreenMapWithConnections({ bundle, connections, renderResults, linkScreenIndex, linkPos, respawnEntIds }: {
  bundle: ScreenBundle;
  connections: ConnectionInfo[];
  renderResults: FloodFillResult[];
  linkScreenIndex: number | null;
  linkPos: { screen: number; row: number; col: number } | null;
  respawnEntIds: Set<number>;
}) {
  const { roomIndex, isIndoors } = useGameUIStore(s => s.map);

  if (isIndoors) {
    return <IndoorMinimap bundle={bundle} connections={connections} renderResults={renderResults} linkScreenIndex={linkScreenIndex} linkPos={linkPos} respawnEntIds={respawnEntIds} roomIndex={roomIndex} />;
  }
  return <OverworldMinimap bundle={bundle} connections={connections} renderResults={renderResults} linkScreenIndex={linkScreenIndex} linkPos={linkPos} respawnEntIds={respawnEntIds} roomIndex={roomIndex} />;
}

/** Indoor/dungeon minimap: single full-size rectangle */
function IndoorMinimap({ bundle, connections, renderResults, linkScreenIndex, linkPos, respawnEntIds, roomIndex }: {
  bundle: ScreenBundle;
  connections: ConnectionInfo[];
  renderResults: FloodFillResult[];
  linkScreenIndex: number | null;
  linkPos: { screen: number; row: number; col: number } | null;
  respawnEntIds: Set<number>;
  roomIndex: number;
}) {
  const EDGE_PAD = 18;
  const AVAIL = 224;
  const innerSize = AVAIL - EDGE_PAD * 2;

  // Indoor always renders as a single full-size tile
  const mapW = innerSize;
  const mapH = innerSize;

  const borderW = 1;
  const mapLeft = EDGE_PAD;
  const mapTop = EDGE_PAD;
  const mapDivLeft = mapLeft - borderW;
  const mapDivTop = mapTop - borderW;

  const totalW = AVAIL;
  const totalH = AVAIL;

  const externalConns = connections.filter(c => !c.isIntraRoom);
  const fallHoleSpawns = useNavigationOverlayStore(s => s.fallHoleSpawns);

  const primaryResult = renderResults.find(r => r.screenIndex === bundle.head) ?? renderResults[0];

  // Detect internal scroll boundaries from room layout
  const layoutInfo = wasmGetRoomLayoutInfo();
  const scrollBoundaries = useMemo(() => {
    if (!layoutInfo) return { horizontal: false, vertical: false };
    const { shape, quadrantFullsizeX, quadrantFullsizeY } = layoutInfo;
    // Horizontal boundary (row 32) exists if room has vertical extent and axis not merged
    const horizontal = (shape === '2x2' || shape === '1x2') && quadrantFullsizeY === 0;
    // Vertical boundary (col 32) exists if room has horizontal extent and axis not merged
    const vertical = (shape === '2x2' || shape === '2x1') && quadrantFullsizeX === 0;
    return { horizontal, vertical };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutInfo?.shape, layoutInfo?.quadrantFullsizeX, layoutInfo?.quadrantFullsizeY]);

  // Find walkable tiles at the scroll boundary positions from flood fill data
  const boundaryTiles = useMemo(() => {
    const result: { x: number; y: number; color: string }[] = [];
    if (!primaryResult) return result;
    const reachable = primaryResult.reachable;
    if (scrollBoundaries.horizontal) {
      // Draw dots on both sides of the boundary (row 31 = south/green side, row 32 = north/blue side)
      for (let col = 0; col < 64; col++) {
        if (reachable[31]?.[col] && reachable[32]?.[col]) {
          result.push({ x: mapLeft + ((col + 0.5) / 64) * mapW, y: mapTop + (31.5 / 64) * mapH, color: EDGE_COLORS.south });
          result.push({ x: mapLeft + ((col + 0.5) / 64) * mapW, y: mapTop + (32.5 / 64) * mapH, color: EDGE_COLORS.north });
        }
      }
    }
    if (scrollBoundaries.vertical) {
      // Draw dots on both sides of the boundary (col 31 = east/orange side, col 32 = west/purple side)
      for (let row = 0; row < 64; row++) {
        if (reachable[row]?.[31] && reachable[row]?.[32]) {
          result.push({ x: mapLeft + (31.5 / 64) * mapW, y: mapTop + ((row + 0.5) / 64) * mapH, color: EDGE_COLORS.east });
          result.push({ x: mapLeft + (32.5 / 64) * mapW, y: mapTop + ((row + 0.5) / 64) * mapH, color: EDGE_COLORS.west });
        }
      }
    }
    return result;
  }, [primaryResult, scrollBoundaries, mapLeft, mapTop, mapW, mapH]);

  const byEdge: Record<string, ConnectionInfo[]> = { north: [], south: [], east: [], west: [] };
  for (const c of externalConns) {
    if (byEdge[c.edge]) byEdge[c.edge].push(c);
  }

  const textColor = (edge: string) => {
    if (edge === 'north' || edge === 'west') return '#fff';
    return '#000';
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: totalW, height: totalH, marginTop: 4, marginLeft: 'auto', marginRight: 'auto' }}>
      {/* Single map rectangle */}
      <div style={{
        position: 'absolute',
        left: mapDivLeft,
        top: mapDivTop,
        width: mapW,
        height: mapH,
        borderRadius: 3,
        background: 'rgba(100,255,100,0.08)',
        border: `${borderW}px solid rgba(100,255,100,0.4)`,
        overflow: 'hidden',
      }}>
        {primaryResult && <ReachabilityCanvas reachable={primaryResult.reachable} size={mapW} tileLayer={primaryResult.tileLayer} bounds={{ minRow: 0, maxRow: 63, minCol: 0, maxCol: 63 }} />}
        {primaryResult && (
          <div style={{ position: 'absolute', bottom: 2, left: 0, right: 0, textAlign: 'center', fontSize: 9, color: '#999', pointerEvents: 'none' }}>
            {primaryResult.reachableCount}/{primaryResult.totalTiles}
          </div>
        )}
      </div>

      {/* Entrance markers */}
      {renderResults.flatMap(r => r.entrances.filter(e => r.transitions.some(t => t.entranceIdx === e.id)).map(ent => {
        const x = mapLeft + ((ent.gridCol + 0.5) / 64) * mapW;
        const y = mapTop + ((ent.gridRow + 0.5) / 64) * mapH;
        const sz = Math.max(6, mapW * 4 / 64);
        const { icon: markerIcon, color: markerColor } = getEntranceIcon(ent.id, ent.roomId, roomIndex, true, respawnEntIds);
        return (
          <div key={`ent-${r.screenIndex}-${ent.id}`} style={{
            position: 'absolute',
            left: x - sz / 2,
            top: y - sz / 2,
            width: sz, height: sz,
            pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon icon={markerIcon} width={sz} height={sz} style={{ color: markerColor, filter: 'drop-shadow(0 0 1px #000)' }} />
          </div>
        );
      }))}

      {/* Fall hole landing markers */}
      {fallHoleSpawns.map((fh, i) => {
        const x = mapLeft + ((fh.gridCol + 0.5) / 64) * mapW;
        const y = mapTop + ((fh.gridRow + 0.5) / 64) * mapH;
        const sz = Math.max(6, mapW * 4 / 64);
        return (
          <div key={`fh-${i}`} style={{
            position: 'absolute',
            left: x - sz / 2,
            top: y - sz / 2,
            width: sz, height: sz,
            border: '1.5px solid #ffcc44',
            borderRadius: 1,
            pointerEvents: 'none',
            background: 'repeating-linear-gradient(45deg, #ffcc44 0px, #ffcc44 2px, transparent 2px, transparent 4px)',
            opacity: 0.8,
          }} />
        );
      })}

      {/* Link position — green dot */}
      {linkPos && bundle.screens.includes(linkPos.screen) && (() => {
        const x = mapLeft + ((linkPos.col + 0.5) / 64) * mapW;
        const y = mapTop + ((linkPos.row + 0.5) / 64) * mapH;
        return (
          <div style={{
            position: 'absolute',
            left: x - 3,
            top: y - 3,
            width: 6, height: 6,
            borderRadius: '50%',
            background: '#4f8',
            boxShadow: '0 0 3px #4f8',
            pointerEvents: 'none',
          }} />
        );
      })()}

      {/* Edge connection indicators */}
      {byEdge.north.map((c, i) => {
        const p0 = c.positions[0], p1 = c.positions[c.positions.length - 1];
        const spanW = Math.max(14, ((p1 - p0 + 1) / 64) * mapW);
        const h = 14;
        // Center the indicator on the midpoint of its tile span
        const midX = mapLeft + ((p0 + p1 + 1) / 2 / 64) * mapW;
        return (
          <div key={`n${i}`} style={{ position: 'absolute', top: mapDivTop - h + borderW, left: Math.round(midX - spanW / 2), width: spanW, height: h, borderRadius: 2, background: EDGE_COLORS.north, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={`${getScreenDisplayName(c.targetScreen)} c${p0}-${p1} (${c.positions.length})`}>
            <span style={{ fontSize: 9, fontWeight: 700, color: textColor('north'), lineHeight: 1 }}>{c.positions.length}</span>
          </div>
        );
      })}

      {byEdge.south.map((c, i) => {
        const p0 = c.positions[0], p1 = c.positions[c.positions.length - 1];
        const spanW = Math.max(14, ((p1 - p0 + 1) / 64) * mapW);
        const h = 14;
        const midX = mapLeft + ((p0 + p1 + 1) / 2 / 64) * mapW;
        return (
          <div key={`s${i}`} style={{ position: 'absolute', top: mapDivTop + mapH + borderW, left: Math.round(midX - spanW / 2), width: spanW, height: h, borderRadius: 2, background: EDGE_COLORS.south, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={`${getScreenDisplayName(c.targetScreen)} c${p0}-${p1} (${c.positions.length})`}>
            <span style={{ fontSize: 9, fontWeight: 700, color: textColor('south'), lineHeight: 1 }}>{c.positions.length}</span>
          </div>
        );
      })}

      {byEdge.west.map((c, i) => {
        const p0 = c.positions[0], p1 = c.positions[c.positions.length - 1];
        const spanH = Math.max(14, ((p1 - p0 + 1) / 64) * mapH);
        const w = 14;
        const midY = mapTop + ((p0 + p1 + 1) / 2 / 64) * mapH;
        return (
          <div key={`w${i}`} style={{ position: 'absolute', left: mapDivLeft - w + borderW, top: Math.round(midY - spanH / 2) - 1, width: w, height: spanH, borderRadius: 2, background: EDGE_COLORS.west, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={`${getScreenDisplayName(c.targetScreen)} r${p0}-${p1} (${c.positions.length})`}>
            <span style={{ fontSize: 9, fontWeight: 700, color: textColor('west'), lineHeight: 1 }}>{c.positions.length}</span>
          </div>
        );
      })}

      {byEdge.east.map((c, i) => {
        const p0 = c.positions[0], p1 = c.positions[c.positions.length - 1];
        const spanH = Math.max(14, ((p1 - p0 + 1) / 64) * mapH);
        const w = 14;
        const midY = mapTop + ((p0 + p1 + 1) / 2 / 64) * mapH;
        return (
          <div key={`e${i}`} style={{ position: 'absolute', left: mapDivLeft + mapW + borderW, top: Math.round(midY - spanH / 2) - 1, width: w, height: spanH, borderRadius: 2, background: EDGE_COLORS.east, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={`${getScreenDisplayName(c.targetScreen)} r${p0}-${p1} (${c.positions.length})`}>
            <span style={{ fontSize: 9, fontWeight: 700, color: textColor('east'), lineHeight: 1 }}>{c.positions.length}</span>
          </div>
        );
      })}

      {/* Internal scroll boundary dots */}
      {boundaryTiles.map((pt, i) => (
        <div key={`scroll-boundary-${i}`} style={{
          position: 'absolute',
          left: pt.x - 1.5,
          top: pt.y - 1.5,
          width: 3,
          height: 3,
          borderRadius: '50%',
          background: pt.color,
          opacity: 0.8,
          pointerEvents: 'none',
        }} />
      ))}
    </div>
  );
}

/** Overworld minimap: multi-cell grid (original behavior) */
function OverworldMinimap({ bundle, connections, renderResults, linkScreenIndex, linkPos, respawnEntIds, roomIndex }: {
  bundle: ScreenBundle;
  connections: ConnectionInfo[];
  renderResults: FloodFillResult[];
  linkScreenIndex: number | null;
  linkPos: { screen: number; row: number; col: number } | null;
  respawnEntIds: Set<number>;
  roomIndex: number;
}) {
  const EDGE_PAD = 18;
  const GAP = 2;
  const AVAIL = 224;

  const gridCols = bundle.cols;
  const gridRows = bundle.rows;

  const cellW = Math.floor((AVAIL - EDGE_PAD * 2 - (gridCols - 1) * GAP) / gridCols);
  const cellH = cellW; // square cells for 512×512 screens
  const gridW = gridCols * cellW + (gridCols - 1) * GAP;
  const gridH = gridRows * cellH + (gridRows - 1) * GAP;
  const totalW = gridW + EDGE_PAD * 2;
  const totalH = gridH + EDGE_PAD * 2;

  const externalConns = connections.filter(c => !c.isIntraRoom);
  const fallHoleSpawns = useNavigationOverlayStore(s => s.fallHoleSpawns);

  const byEdge: Record<string, ConnectionInfo[]> = { north: [], south: [], east: [], west: [] };
  for (const c of externalConns) {
    if (byEdge[c.edge]) byEdge[c.edge].push(c);
  }

  const textColor = (edge: string) => {
    if (edge === 'north' || edge === 'west') return '#fff';
    return '#000';
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: totalW, height: totalH, marginTop: 4, marginLeft: 'auto', marginRight: 'auto' }}>
      {/* Grid cells */}
      {bundle.screens.map((scr, idx) => {
        const col = idx % bundle.cols;
        const row = Math.floor(idx / bundle.cols);
        const isActive = linkScreenIndex === scr;
        const analyzed = renderResults.some(r => r.screenIndex === scr);
        const scrResult = renderResults.find(r => r.screenIndex === scr);
        return (
          <div key={scr} style={{
            position: 'absolute',
            left: EDGE_PAD + col * (cellW + GAP),
            top: EDGE_PAD + row * (cellH + GAP),
            width: cellW, height: cellH,
            borderRadius: 3, fontSize: 10, textAlign: 'center',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            background: isActive ? 'rgba(100,255,100,0.12)' : analyzed ? 'rgba(100,200,255,0.08)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isActive ? 'rgba(100,255,100,0.5)' : analyzed ? 'rgba(100,200,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: isActive ? '#8f8' : analyzed ? '#8cf' : '#666',
            overflow: 'hidden',
          }}>
            {scrResult && <ReachabilityCanvas reachable={scrResult.reachable} size={cellW} tileLayer={scrResult.tileLayer} />}
            <div style={{ fontWeight: 700, fontSize: 11, position: 'relative' }}>{bundle.subNames[scr] || bundle.screenNames[scr]}</div>
            <div style={{ color: '#555', fontSize: 9, position: 'relative' }}>0x{scr.toString(16).toUpperCase()}</div>
            {scrResult && <div style={{ fontSize: 9, color: '#999', position: 'relative' }}>{scrResult.reachableCount}/{scrResult.totalTiles}</div>}
          </div>
        );
      })}

      {/* Entrance markers */}
      {renderResults.flatMap(r => r.entrances.filter(e => r.transitions.some(t => t.entranceIdx === e.id)).map(ent => {
        const scrIdx = bundle.screens.indexOf(r.screenIndex);
        if (scrIdx < 0) return null;
        const cellCol = scrIdx % bundle.cols;
        const cellRow = Math.floor(scrIdx / bundle.cols);
        const cellLeft = EDGE_PAD + cellCol * (cellW + GAP);
        const cellTop = EDGE_PAD + cellRow * (cellH + GAP);
        const localX = (ent.gridCol / 64) * cellW;
        const localY = (ent.gridRow / 64) * cellH;
        const sz = Math.max(6, cellW * 4 / 64);
        const { icon: markerIcon, color: markerColor } = getEntranceIcon(ent.id, ent.roomId, roomIndex, false, respawnEntIds);
        return (
          <div key={`ent-${r.screenIndex}-${ent.id}`} style={{
            position: 'absolute',
            left: cellLeft + localX - sz / 2,
            top: cellTop + localY - sz / 2,
            width: sz, height: sz,
            pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon icon={markerIcon} width={sz} height={sz} style={{ color: markerColor, filter: 'drop-shadow(0 0 1px #000)' }} />
          </div>
        );
      }))}

      {/* Fall hole landing markers */}
      {fallHoleSpawns.map((fh, i) => {
        const cellLeft = EDGE_PAD;
        const cellTop = EDGE_PAD;
        const localX = (fh.gridCol / 64) * cellW;
        const localY = (fh.gridRow / 64) * cellH;
        const sz = Math.max(6, cellW * 4 / 64);
        return (
          <div key={`fh-${i}`} style={{
            position: 'absolute',
            left: cellLeft + localX - sz / 2,
            top: cellTop + localY - sz / 2,
            width: sz, height: sz,
            border: '1.5px solid #ffcc44',
            borderRadius: 1,
            pointerEvents: 'none',
            background: 'repeating-linear-gradient(45deg, #ffcc44 0px, #ffcc44 2px, transparent 2px, transparent 4px)',
            opacity: 0.8,
          }} />
        );
      })}

      {/* Link position — green dot */}
      {linkPos && bundle.screens.includes(linkPos.screen) && (() => {
        const scrIdx = bundle.screens.indexOf(linkPos.screen);
        const col = scrIdx % bundle.cols;
        const row = Math.floor(scrIdx / bundle.cols);
        const cellLeft = EDGE_PAD + col * (cellW + GAP);
        const cellTop = EDGE_PAD + row * (cellH + GAP);
        const x = (linkPos.col / 64) * cellW;
        const y = (linkPos.row / 64) * cellH;
        return (
          <div style={{
            position: 'absolute',
            left: cellLeft + x - 3,
            top: cellTop + y - 3,
            width: 6, height: 6,
            borderRadius: '50%',
            background: '#4f8',
            boxShadow: '0 0 3px #4f8',
            pointerEvents: 'none',
          }} />
        );
      })()}

      {/* Edge connection indicators */}
      {byEdge.north.map((c, i) => {
        const scrIdx = bundle.screens.indexOf(c.sourceScreen!);
        const col = scrIdx >= 0 ? scrIdx % bundle.cols : 0;
        const colStart = EDGE_PAD + col * (cellW + GAP);
        const p0 = c.positions[0], p1 = c.positions[c.positions.length - 1];
        const x0 = (p0 / 64) * cellW;
        const spanW = Math.max(14, ((p1 - p0 + 1) / 64) * cellW);
        return (
          <div key={`n${i}`} style={{ position: 'absolute', top: EDGE_PAD - 15, left: colStart + x0, width: spanW, height: 14, borderRadius: 2, background: EDGE_COLORS.north, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={`${getScreenDisplayName(c.targetScreen)} c${p0}-${p1} (${c.positions.length})`}>
            <span style={{ fontSize: 9, fontWeight: 700, color: textColor('north'), lineHeight: 1 }}>{c.positions.length}</span>
          </div>
        );
      })}

      {byEdge.south.map((c, i) => {
        const scrIdx = bundle.screens.indexOf(c.sourceScreen!);
        const col = scrIdx >= 0 ? scrIdx % bundle.cols : 0;
        const colStart = EDGE_PAD + col * (cellW + GAP);
        const p0 = c.positions[0], p1 = c.positions[c.positions.length - 1];
        const x0 = (p0 / 64) * cellW;
        const spanW = Math.max(14, ((p1 - p0 + 1) / 64) * cellW);
        return (
          <div key={`s${i}`} style={{ position: 'absolute', top: EDGE_PAD + gridH + 1, left: colStart + x0, width: spanW, height: 14, borderRadius: 2, background: EDGE_COLORS.south, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={`${getScreenDisplayName(c.targetScreen)} c${p0}-${p1} (${c.positions.length})`}>
            <span style={{ fontSize: 9, fontWeight: 700, color: textColor('south'), lineHeight: 1 }}>{c.positions.length}</span>
          </div>
        );
      })}

      {byEdge.west.map((c, i) => {
        const scrIdx = bundle.screens.indexOf(c.sourceScreen!);
        const row = scrIdx >= 0 ? Math.floor(scrIdx / bundle.cols) : 0;
        const rowStart = EDGE_PAD + row * (cellH + GAP);
        const p0 = c.positions[0], p1 = c.positions[c.positions.length - 1];
        const y0 = (p0 / 64) * cellH;
        const spanH = Math.max(14, ((p1 - p0 + 1) / 64) * cellH);
        return (
          <div key={`w${i}`} style={{ position: 'absolute', left: EDGE_PAD - 15, top: rowStart + y0, width: 14, height: spanH, borderRadius: 2, background: EDGE_COLORS.west, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={`${getScreenDisplayName(c.targetScreen)} r${p0}-${p1} (${c.positions.length})`}>
            <span style={{ fontSize: 9, fontWeight: 700, color: textColor('west'), lineHeight: 1 }}>{c.positions.length}</span>
          </div>
        );
      })}

      {byEdge.east.map((c, i) => {
        const scrIdx = bundle.screens.indexOf(c.sourceScreen!);
        const row = scrIdx >= 0 ? Math.floor(scrIdx / bundle.cols) : 0;
        const rowStart = EDGE_PAD + row * (cellH + GAP);
        const p0 = c.positions[0], p1 = c.positions[c.positions.length - 1];
        const y0 = (p0 / 64) * cellH;
        const spanH = Math.max(14, ((p1 - p0 + 1) / 64) * cellH);
        return (
          <div key={`e${i}`} style={{ position: 'absolute', left: EDGE_PAD + gridW + 1, top: rowStart + y0, width: 14, height: spanH, borderRadius: 2, background: EDGE_COLORS.east, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={`${getScreenDisplayName(c.targetScreen)} r${p0}-${p1} (${c.positions.length})`}>
            <span style={{ fontSize: 9, fontWeight: 700, color: textColor('east'), lineHeight: 1 }}>{c.positions.length}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  root: {
    background: 'rgba(0,0,0,0.8)',
    color: '#ccc',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    lineHeight: '16px',
    padding: '6px 8px',
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  section: { display: 'flex', flexDirection: 'column', gap: 3 },
  sectionTitle: { fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1, paddingTop: 4 },
  locName: { fontSize: 13, fontWeight: 700, color: '#fff' },
  meta: { fontSize: 10, color: '#888' },
  actions: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  btn: {
    padding: '3px 8px', background: 'rgba(100,200,100,0.12)', border: '1px solid rgba(100,200,100,0.35)',
    borderRadius: 3, color: '#8f8', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
  btnDisabled: { opacity: 0.35, cursor: 'not-allowed' },
  btnActive: { background: 'rgba(100,200,255,0.18)', borderColor: 'rgba(100,200,255,0.5)', color: '#8cf' },
  infoBox: { display: 'flex', flexDirection: 'column', gap: 1, padding: '4px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' },
  infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#ccc' },
  infoLabel: { color: '#888' },
  connCard: { display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 6px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', marginTop: 2 },
  card: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 88, padding: '6px 4px', borderRadius: 5, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' },
  cardGraphic: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 48, flexShrink: 0 },
  cardTitle: { fontSize: 9, fontWeight: 600, color: '#ddd', textAlign: 'center', lineHeight: '11px', marginTop: 4, wordBreak: 'break-word' } as React.CSSProperties,
  cardSub: { fontSize: 8, color: '#666', marginTop: 2 },
  diamond: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  diamondRow: { display: 'flex', justifyContent: 'center' },
  diamondMid: { display: 'flex', gap: 4, justifyContent: 'center' },
  connHeader: { display: 'flex', alignItems: 'center', gap: 5 },
  connTitle: { fontSize: 11, fontWeight: 600, color: '#ddd' },
  dimBadge: { fontSize: 9, padding: '0 4px', borderRadius: 3, background: 'rgba(255,255,255,0.06)', color: '#888', marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" },
};

// ─── DescRow — clickable label that expands a description ──────────────

function DescRow({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div style={S.infoRow}>
        <span style={{ ...S.infoLabel, cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '2px' } as React.CSSProperties} onClick={() => setOpen(o => !o)}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{children}</span>
      </div>
      {open && (
        <div style={{ fontSize: 9, color: '#999', lineHeight: '12px', padding: '2px 0 4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{desc}</div>
      )}
    </div>
  );
}

export { NavigationWidgetContent };
