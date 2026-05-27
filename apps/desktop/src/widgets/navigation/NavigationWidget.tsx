/**
 * NavigationWidgetContent — "Location & Navigation" widget.
 *
 * Shows current overworld location info + connections with review controls.
 * Triggers flood-fill analysis and drives the in-game overlay.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Icon } from '@iconify/react/offline';
import woodenDoor from '@iconify-icons/game-icons/wooden-door';
import caveEntrance from '@iconify-icons/game-icons/cave-entrance';
import holeIcon from '@iconify-icons/game-icons/hole';
import wellIcon from '@iconify-icons/game-icons/well';
import dungeonGate from '@iconify-icons/game-icons/dungeon-gate';
import fairyIcon from '@iconify-icons/game-icons/fairy';
import shopIcon from '@iconify-icons/game-icons/shop';
import houseIcon from '@iconify-icons/game-icons/house';
import unknownIcon from '@iconify-icons/game-icons/perspective-dice-six-faces-random';
import exitDoorIcon from '@iconify-icons/game-icons/exit-door';
import { useGameUIStore } from '../../stores/game-ui-store';
import { useConnectionOverlayStore } from '../../stores/connection-overlay-store';
import { SCREEN_NAMES, buildScreenBundle, ENTRANCE_NAMES, classifyEntrance } from '@shared/game/navigation';
import type { ScreenBundle, EntranceType } from '@shared/game/navigation';
import { getRegionLookup } from '@shared/game/data/regions';
import { wasmGetViewportInfo, wasmGetOverworldVariant, wasmGetIndoorAttrGrid, wasmGetIndoorUncleBlockers, wasmGetLiveSprites, wasmGetOverworldGuardSpawns } from '../../lib/game';
import { getCompletedChecks } from '../../lib/game/tracker';
import type { OverworldVariantInfo } from '../../lib/game';
import type { TileAttrContext } from '@shared/game/navigation/tile-attrs';

import type { FloodFillResult, ConnectionInfo } from '@shared/game/navigation';

type ReviewStatus = 'neutral' | 'good' | 'bad' | 'yellow';
interface ReviewEntry { status: ReviewStatus; comment?: string; }
interface LocationReview { status: ReviewStatus; comment?: string; connections: Record<string, ReviewEntry>; }
type ReviewData = Record<string, LocationReview>;

const EDGE_COLORS: Record<string, string> = {
  north: '#4488ff', south: '#44ff88', east: '#ff8844', west: '#bb44ff', entrance: '#ffcc44',
};
const STATUS_BTNS: { key: ReviewStatus; label: string; color: string }[] = [
  { key: 'neutral', label: '—', color: '#666' },
  { key: 'good', label: '✓', color: '#4c4' },
  { key: 'bad', label: '✗', color: '#f44' },
  { key: 'yellow', label: '⚠', color: '#fc4' },
];

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

function NavigationWidgetContent({ romFile }: { romFile: string }) {
  const { overworldScreenIndex, roomIndex, isIndoors, isDarkWorld, palaceIndex } = useGameUIStore(s => s.map);
  const equipment = useGameUIStore(s => s.equipment);
  const inventoryItems = useGameUIStore(s => s.inventory.items);
  const overlayStore = useConnectionOverlayStore();
  const [reviewData, setReviewData] = useState<ReviewData>({});
  const [result, setResult] = useState<FloodFillResult | null>(null);
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);

  const [running, setRunning] = useState(false);
  const [autoRun, setAutoRun] = useState(false);
  const [variant, setVariant] = useState<OverworldVariantInfo | null>(null);
  const [dynamicBlockerCount, setDynamicBlockerCount] = useState(0);
  const [visibleScreenIndices, setVisibleScreenIndices] = useState<number[]>([]);
  const [screenBundle, setScreenBundle] = useState<ScreenBundle | null>(null);
  const [debugTick, setDebugTick] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevScreenRef = useRef<number | null>(null);
  const prevLiveOverworldScreenRef = useRef<number | null>(null);
  const prevInventoryKeyRef = useRef<string | null>(null);
  const pendingGroundedRunRef = useRef(false);
  const handleRunRef = useRef<(() => Promise<void>) | null>(null);
  const pendingAutoSecondPassRef = useRef(false);
  const autoSecondPassTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use room index indoors; overworld screen index outside.
  const activeScreenIndex = isIndoors ? roomIndex : overworldScreenIndex;

  // Poll variant info on screen changes
  useEffect(() => {
    if (isIndoors) { setVariant(null); return; }
    const v = wasmGetOverworldVariant(overworldScreenIndex);
    setVariant(v);
  }, [overworldScreenIndex, isIndoors]);

  // Load review data
  useEffect(() => {
    window.api.loadConnectionReview().then((d: unknown) => setReviewData((d ?? {}) as ReviewData));
  }, []);

  const persist = useCallback((next: ReviewData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => window.api.saveConnectionReview(next), 300);
  }, []);

  const locationKey = isIndoors
    ? `room-${roomIndex.toString(16).padStart(3, '0')}`
    : `${isDarkWorld ? 'dw' : 'lw'}-${overworldScreenIndex.toString(16).padStart(2, '0')}`;
  const screenName = isIndoors
    ? (getRegionLookup().byCaveRoom.get(roomIndex)?.subtitle
      ?? getRegionLookup().byCaveRoom.get(roomIndex)?.name
      ?? getRegionLookup().byDungeonRoom.get(`${palaceIndex}:${roomIndex}`)?.subtitle
      ?? getRegionLookup().byDungeonRoom.get(`${palaceIndex}:${roomIndex}`)?.name
      ?? `Room 0x${roomIndex.toString(16).toUpperCase()}`)
    : (SCREEN_NAMES[overworldScreenIndex] ?? `Screen 0x${overworldScreenIndex.toString(16).toUpperCase()}`);
  const locationReview = reviewData[locationKey] ?? { status: 'neutral' as ReviewStatus, connections: {} };
  const displayedVariant = !isIndoors
    ? (result ? wasmGetOverworldVariant(result.screenIndex) : variant)
    : null;
  const renderResults = overlayStore.results.length > 0
    ? overlayStore.results
    : (result ? [result] : []);
  const reachableSum = renderResults.reduce((sum, r) => sum + r.reachableCount, 0);
  const totalTilesSum = renderResults.reduce((sum, r) => sum + r.totalTiles, 0);
  const entranceSum = renderResults.reduce((sum, r) => sum + r.entrances.length, 0);
  // Force a lightweight periodic rerender so live debug values update while moving.
  useEffect(() => {
    const id = setInterval(() => setDebugTick(t => (t + 1) & 1023), 200);
    return () => clearInterval(id);
  }, []);
  const vpDebug = wasmGetViewportInfo?.();
  const linkDebug = (() => {
    void debugTick;
    if (!vpDebug) return null;
    const liveScreenCol = (vpDebug.linkX >> 9) & 7;
    const liveScreenRow = (vpDebug.linkY >> 9) & 7;
    const liveScreenIndex = (liveScreenRow << 3) | liveScreenCol;
    const screenWorldX = liveScreenCol * 512;
    const screenWorldY = liveScreenRow * 512;

    const relX = vpDebug.linkX - screenWorldX;
    const relY = vpDebug.linkY - screenWorldY;
    const tileMinCol = Math.floor(relX / 8);
    const tileMaxCol = Math.floor((relX + 15) / 8);
    const tileMinRow = Math.floor(relY / 8);
    const tileMaxRow = Math.floor((relY + 15) / 8);

    const xc = vpDebug.linkX >> 3;
    const baseX = screenWorldX >> 3;
    const map16Col = ((xc - baseX) & 0x3E) >> 1;
    const yc = vpDebug.linkY + 7;
    const baseY = screenWorldY;
    const map16Row = ((yc - baseY) & 0x1F0) >> 4;

    return {
      linkX: vpDebug.linkX,
      linkY: vpDebug.linkY,
      relX,
      relY,
      tileMinCol,
      tileMaxCol,
      tileMinRow,
      tileMaxRow,
      map16Row,
      map16Col,
      liveScreenIndex,
    };
  })();

  // Clear overlay when screen changes
  useEffect(() => {
    if (result && result.screenIndex !== activeScreenIndex) {
      setResult(null);
      setConnections([]);
      overlayStore.clear();
    }
  }, [activeScreenIndex]);

  // Run flood fill
  const handleRun = useCallback(async () => {
    if (!romFile || running) return;
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
      let blockerWorldPoints: Array<{ x: number; y: number }> = [];

      // Build overworld dynamic blockers from live sprite data independently of viewport
      // so blockers don't disappear if viewport data is transiently unavailable.
      if (!isIndoors) {
        const live = wasmGetLiveSprites();
        const staticGuards = wasmGetOverworldGuardSpawns();
        // Tutorial guards/barriers (0x3F/0x40) gate progression via expanded contact checks
        // in game logic, so we inflate their effective blocker footprint for BFS.
        const livePoints = live.flatMap(s => {
          if (s.type === 0x3f || s.type === 0x40) {
            const pts: Array<{ x: number; y: number }> = [];
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                pts.push({ x: s.x + dc * 8, y: s.y + dr * 8 });
              }
            }
            return pts;
          }
          return [{ x: s.x, y: s.y }];
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
          rawAttrGrid = wasmGetIndoorAttrGrid() ?? undefined;

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
        const relPixelY = vp.linkY - screenWorldY;

        // Match overlay debug footprint: Link covers linkX..linkX+15 and linkY..linkY+15.
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

      // Helper to run flood fill for one screen with a given start position
      const runOne = async (screenIndex: number, sp?: { row: number; col: number }, extraSeeds?: Array<{ row: number; col: number }>) => {
        const runVariant = (!isIndoors) ? wasmGetOverworldVariant(screenIndex) : null;
        const dynamicBlockers = getBlockersForScreen(screenIndex);
        const resp = await window.api.runFloodFill(
          romFile,
          screenIndex,
          items,
          runVariant ? {
            progressTier: runVariant.progressIndicator,
            eventOverlay: runVariant.eventOverlayActive,
            eventFlags: runVariant.screenEventFlags,
          } : undefined,
          sp,
          tileContext,
          rawAttrGrid,
          dynamicBlockers,
          extraSeeds,
        );
        return { screenIndex, resp, dynamicBlockers };
      };

      // Run primary screen first (from Link's position), then iteratively propagate
      // to adjacent screens ONLY within the same big-screen group.
      // Single screens: flood only that one screen (no propagation).
      // Big screens (2×2): flood primary first, then propagate to other quadrants via border exits.
      const groupScreens = isIndoors ? [primaryScreenIndex] : await window.api.getBigScreenGroup(romFile, primaryScreenIndex);
      const allowedScreens = new Set<number>(groupScreens);
      // Only build screen bundles for overworld — indoor rooms use screenName from region lookup
      setScreenBundle(isIndoors ? null : buildScreenBundle(groupScreens));
      const MAX_ITERATIONS = 8;
      let iterations = 0;
      const analyzed = new Map<number, Awaited<ReturnType<typeof runOne>>>();
      const pendingSeeds = new Map<number, { row: number; col: number }[]>();

      // Start with primary screen only — others get seeded from border propagation
      pendingSeeds.set(primaryScreenIndex, [startPos!]);

      while (pendingSeeds.size > 0 && iterations < MAX_ITERATIONS) {
        iterations++;

        // Run all pending screens with their accumulated seeds
        const batch = [...pendingSeeds.entries()];
        pendingSeeds.clear();

        const batchResponses = await Promise.all(
          batch.map(([screenIndex, seedList]) => {
            const primary = seedList[0];
            const extra = seedList.length > 1 ? seedList.slice(1) : undefined;
            return runOne(screenIndex, primary, extra);
          }),
        );

        for (const resp of batchResponses) {
          if ('error' in resp.resp) continue;
          analyzed.set(resp.screenIndex, resp);

          // Extract border transitions to discover new adjacent screens
          const transitions: Array<{ edge: string; col: number; row: number }> = resp.resp.transitions ?? [];
          for (const t of transitions) {
            if (t.edge === 'entrance') continue;
            let adjScreen: number | null = null;
            let entryPos: { row: number; col: number } | null = null;
            const sRow = (resp.screenIndex >> 3) & 7;
            const sCol = resp.screenIndex & 7;
            switch (t.edge) {
              case 'north': adjScreen = sRow > 0 ? ((sRow - 1) << 3 | sCol) : null; entryPos = { row: 63, col: t.col }; break;
              case 'south': adjScreen = sRow < 7 ? ((sRow + 1) << 3 | sCol) : null; entryPos = { row: 0, col: t.col }; break;
              case 'west': adjScreen = sCol > 0 ? (sRow << 3 | (sCol - 1)) : null; entryPos = { row: t.row, col: 63 }; break;
              case 'east': adjScreen = sCol < 7 ? (sRow << 3 | (sCol + 1)) : null; entryPos = { row: t.row, col: 0 }; break;
            }
            if (adjScreen === null || entryPos === null) continue;
            if (!allowedScreens.has(adjScreen)) continue;
            if (analyzed.has(adjScreen)) {
              // Already analyzed — skip (could re-seed but that's expensive)
              continue;
            }
            // Add to pending seeds (accumulates multiple entries per screen)
            const existing = pendingSeeds.get(adjScreen) ?? [];
            existing.push(entryPos);
            pendingSeeds.set(adjScreen, existing);
          }
        }
      }

      const responses = [...analyzed.values()];

      const failed = responses.find(x => 'error' in x.resp);
      if (failed && 'error' in failed.resp) {
        console.error(failed.resp.error);
        return;
      }

      // Update visible screen list to reflect all screens actually analyzed
      setVisibleScreenIndices(responses.map(r => r.screenIndex).sort((a, b) => a - b));

      const normalized = responses
        .filter(x => !('error' in x.resp))
        .map(x => ({
          screenIndex: x.screenIndex,
          resp: x.resp as {
            screenIndex: number;
            tileContext: string;
            reachable: number[][];
            ledges?: unknown[];
            attrGrid: number[][];
            startPos?: { row: number; col: number };
            connections: ConnectionInfo[];
            bundles?: BorderBundle[];
            dynamicBlockerCells?: Array<{ row: number; col: number }>;
            transitions: Array<{ edge: string; row: number; col: number; requirements: string[]; entranceIdx?: number }>;
            entrances: Array<{ id: number; gridRow: number; gridCol: number; roomId: number; area: number; pos: number }>;
            reachableCount: number;
            totalTiles: number;
            borders: FloodFillResult['borders'];
            reqGrid?: string[][];
            hookTargets?: Array<{ row: number; col: number }>;
            variant?: { progressTier: number; eventOverlay: boolean; eventFlags: number };
          },
          dynamicBlockers: x.dynamicBlockers,
        }));

      if (normalized.length === 0) return;

      const fillResults: FloodFillResult[] = normalized.map(({ resp }) => {
        const reachableEntranceIds = new Set(
          resp.transitions
            .filter((t: any) => t.edge === 'entrance' && typeof t.entranceIdx === 'number')
            .map((t: any) => t.entranceIdx as number),
        );

        const entrances = resp.entrances.filter((ent: { id: number }) => reachableEntranceIds.has(ent.id));

        return {
          screenIndex: resp.screenIndex,
          tileContext: resp.tileContext as FloodFillResult['tileContext'],
          startPos: resp.startPos ?? { row: 32, col: 32 },
          reachable: resp.reachable.map((row: number[]) => row.map((v: number) => v === 1)),
          transitions: resp.transitions as FloodFillResult['transitions'],
          reachableCount: resp.reachableCount,
          totalTiles: resp.totalTiles,
          entrances,
          ledges: (resp.ledges as FloodFillResult['ledges']) ?? [],
          attrGrid: resp.attrGrid,
          reqGrid: resp.reqGrid,
          dynamicBlockerCells: resp.dynamicBlockerCells,
          hookTargets: resp.hookTargets,
          variant: resp.variant,
          borders: resp.borders,
        };
      });

      const primaryResult = fillResults.find(r => r.screenIndex === primaryScreenIndex) ?? fillResults[0];

      // Aggregate connections from ALL analyzed screens — no filtering.
      // ALL connections are shown (internal between sub-screens + external leaving the group).
      const allConnections: ConnectionInfo[] = [];
      for (const n of normalized) {
        const conns: ConnectionInfo[] = n.resp.connections ?? [];
        for (const c of conns) {
          allConnections.push({ ...c, sourceScreen: n.screenIndex });
        }
      }

      setDynamicBlockerCount(normalized.reduce((sum, x) => sum + (x.resp.dynamicBlockerCells?.length ?? x.dynamicBlockers?.length ?? 0), 0));
      setResult(primaryResult);
      setConnections(allConnections);

      overlayStore.setData(primaryResult, allConnections, fillResults);
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
  }, [romFile, activeScreenIndex, isIndoors, overworldScreenIndex, running, equipment, roomIndex, variant, inventoryItems]);

  handleRunRef.current = handleRun;

  useEffect(() => () => {
    if (autoSecondPassTimerRef.current) clearTimeout(autoSecondPassTimerRef.current);
  }, []);

  // Auto-run flood fill on screen change
  useEffect(() => {
    if (!autoRun || !romFile || running) return;
    if (prevScreenRef.current !== null && prevScreenRef.current !== activeScreenIndex) {
      // Delay flood fill until Link is grounded (submodule === 0).
      // During transitions (falling, entering doors), submodule is non-zero.
      const vp = wasmGetViewportInfo?.();
      if (vp && vp.submodule !== 0) {
        pendingGroundedRunRef.current = true;
      } else {
        pendingAutoSecondPassRef.current = true;
        handleRunRef.current?.();
      }
    }
    prevScreenRef.current = activeScreenIndex;
  }, [autoRun, activeScreenIndex, romFile, running, handleRun]);

  useEffect(() => {
    if (!autoRun || !romFile || running || isIndoors) return;
    const vp = wasmGetViewportInfo?.();
    if (!vp) return;
    const liveScreen = (((vp.linkY >> 9) & 7) << 3) | ((vp.linkX >> 9) & 7);
    if (prevLiveOverworldScreenRef.current !== null && prevLiveOverworldScreenRef.current !== liveScreen) {
      if (vp.submodule !== 0) {
        pendingGroundedRunRef.current = true;
      } else {
        pendingAutoSecondPassRef.current = true;
        handleRunRef.current?.();
      }
    }
    prevLiveOverworldScreenRef.current = liveScreen;
  }, [autoRun, romFile, running, isIndoors, debugTick]);

  // Check for pending grounded run on each tick (fires every 200ms via debugTick)
  useEffect(() => {
    if (!pendingGroundedRunRef.current || !autoRun || running) return;
    const vp = wasmGetViewportInfo?.();
    if (vp && vp.submodule === 0) {
      pendingGroundedRunRef.current = false;
      pendingAutoSecondPassRef.current = true;
      handleRunRef.current?.();
    }
  }, [autoRun, running, debugTick]);

  // Auto-run flood fill when inventory/equipment changes (affects reachability)
  useEffect(() => {
    if (!autoRun || !romFile || running) return;
    const key = `${equipment.sword},${equipment.gloves},${equipment.boots ? 1 : 0},${equipment.flippers ? 1 : 0},${inventoryItems[2]},${inventoryItems[11]}`;
    if (prevInventoryKeyRef.current !== null && prevInventoryKeyRef.current !== key) {
      handleRunRef.current?.();
    }
    prevInventoryKeyRef.current = key;
  }, [autoRun, romFile, running, equipment, inventoryItems]);

  // Toggle overlay
  const toggleOverlay = useCallback(() => {
    if (overlayStore.visible) overlayStore.setVisible(false);
    else if (result) overlayStore.setData(result, connections, renderResults);
  }, [result, connections, renderResults]);

  // Review helpers
  const setLocStatus = (status: ReviewStatus) => {
    setReviewData(prev => {
      const entry = prev[locationKey] ?? { status: 'neutral', connections: {} };
      const next = { ...prev, [locationKey]: { ...entry, status } };
      persist(next);
      return next;
    });
  };
  const setLocComment = (comment: string) => {
    setReviewData(prev => {
      const entry = prev[locationKey] ?? { status: 'neutral' as ReviewStatus, connections: {} };
      const next = { ...prev, [locationKey]: { ...entry, comment } };
      persist(next);
      return next;
    });
  };
  const setConnStatus = (connKey: string, status: ReviewStatus) => {
    setReviewData(prev => {
      const loc = prev[locationKey] ?? { status: 'neutral' as ReviewStatus, connections: {} };
      const conn = loc.connections[connKey] ?? { status: 'neutral' };
      const next = { ...prev, [locationKey]: { ...loc, connections: { ...loc.connections, [connKey]: { ...conn, status } } } };
      persist(next);
      return next;
    });
  };
  const setConnComment = (connKey: string, comment: string) => {
    setReviewData(prev => {
      const loc = prev[locationKey] ?? { status: 'neutral' as ReviewStatus, connections: {} };
      const conn = loc.connections[connKey] ?? { status: 'neutral' as ReviewStatus };
      const next = { ...prev, [locationKey]: { ...loc, connections: { ...loc.connections, [connKey]: { ...conn, comment } } } };
      persist(next);
      return next;
    });
  };

  // Derived: classify connections as internal (between bundle screens) vs external
  const bundleScreenSet = useMemo(() => new Set(screenBundle?.screens ?? []), [screenBundle]);
  const sortConn = (a: ConnectionInfo, b: ConnectionInfo) => {
    const edgeOrder = { north: 0, south: 1, west: 2, east: 3 };
    const d = (edgeOrder[a.edge] ?? 0) - (edgeOrder[b.edge] ?? 0);
    if (d !== 0) return d;
    const sa = a.sourceScreen ?? 0, sb = b.sourceScreen ?? 0;
    if (sa !== sb) return sa - sb;
    return a.targetScreen - b.targetScreen;
  };
  const externalConnections = useMemo(() => connections.filter(c => !bundleScreenSet.has(c.targetScreen)).sort(sortConn), [connections, bundleScreenSet]);
  const internalConnections = useMemo(() => {
    // Deduplicate: A→east→B and B→west→A are the same border. Keep the spatially-correct one.
    const internal = connections.filter(c => bundleScreenSet.has(c.targetScreen)).sort(sortConn);
    const bestByPair = new Map<string, ConnectionInfo>();
    for (const c of internal) {
      const pair = [c.sourceScreen ?? 0, c.targetScreen].sort((a, b) => a - b);
      const key = `${pair[0]}-${pair[1]}`;
      const existing = bestByPair.get(key);
      // Prefer east (left→right) and south (top→bottom) for spatial correctness
      if (!existing || c.edge === 'east' || c.edge === 'south') {
        bestByPair.set(key, c);
      }
    }
    return [...bestByPair.values()];
  }, [connections, bundleScreenSet]);

  return (
    <div style={S.root}>
      {/* ═══ 1. BUNDLE TITLE + SCREEN MAP ═══ */}
      <div style={S.section}>
        <div style={S.locName}>
          {screenBundle ? screenBundle.name : screenName}
          {screenBundle?.isMulti && <span style={{ fontSize: 9, color: '#888', marginLeft: 6 }}>({screenBundle.screens.length} screens)</span>}
        </div>
        <div style={S.meta}>
          {locationKey} · {isIndoors ? 'INDOOR' : (isDarkWorld ? 'DW' : 'LW')}
          {!isIndoors && ` · R${(overworldScreenIndex >> 3) & 7} C${overworldScreenIndex & 7}`}
        </div>

        {/* Screen map with edge connection indicators */}
        {screenBundle && (
          <ScreenMapWithConnections bundle={screenBundle} connections={externalConnections} renderResults={renderResults} linkScreenIndex={linkDebug?.liveScreenIndex ?? null} />
        )}
      </div>

      {/* ═══ 2. PROGRESS / FLAGS ═══ */}
      {displayedVariant && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Progress</div>
          <div style={S.infoBox}>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Phase</span>
              <span style={{ color: '#fc6' }}>{displayedVariant.phaseLabel}</span>
            </div>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Tile Patch</span>
              {displayedVariant.eventOverlayActive
                ? <span style={{ color: '#4f8' }}>active</span>
                : <span style={{ color: '#666' }}>none</span>}
            </div>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Flags</span>
              <span style={{ color: '#aac' }}>0x{displayedVariant.screenEventFlags.toString(16).padStart(2, '0')}</span>
            </div>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>NPC Blockers</span>
              <span style={{ color: dynamicBlockerCount > 0 ? '#fc6' : '#666' }}>{dynamicBlockerCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 3. LINK POSITION ═══ */}
      {linkDebug && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Link</div>
          <div style={S.infoBox}>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>World</span>
              <span style={{ color: '#7f7' }}>({linkDebug.linkX}, {linkDebug.linkY})</span>
            </div>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Relative</span>
              <span style={{ color: '#7f7' }}>({linkDebug.relX}, {linkDebug.relY})</span>
            </div>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Sub-tile</span>
              <span style={{ color: '#7f7' }}>r{linkDebug.tileMinRow}–{linkDebug.tileMaxRow} c{linkDebug.tileMinCol}–{linkDebug.tileMaxCol}</span>
            </div>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Map16</span>
              <span style={{ color: '#7f7' }}>({linkDebug.map16Row}, {linkDebug.map16Col})</span>
            </div>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Live Screen</span>
              <span style={{ color: '#7f7' }}>0x{linkDebug.liveScreenIndex.toString(16).toUpperCase()}</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 4. FUNCTIONS ═══ */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Functions</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <button style={{ ...S.btn, ...(running ? S.btnDisabled : {}) }} onClick={handleRun} disabled={running || !romFile}>
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
              <span style={S.infoLabel}>Connections</span>
              <span>{connections.length} ({externalConnections.length} ext + {internalConnections.length} int)</span>
            </div>
          </div>
        )}
      </div>

      {/* ═══ 5. CONNECTIONS ═══ */}
      {externalConnections.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Connections</div>
          {externalConnections.map(conn => {
            const connKey = `${conn.edge}-${conn.sourceScreen?.toString(16)}-${conn.targetScreen.toString(16)}`;
            const targetName = SCREEN_NAMES[conn.targetScreen] ?? `0x${conn.targetScreen.toString(16).toUpperCase()}`;
            const fromLabel = screenBundle?.isMulti && conn.sourceScreen != null
              ? ` (${screenBundle.subNames[conn.sourceScreen] ?? ''})`
              : '';
            return (
              <div key={connKey} style={S.connCard}>
                <div style={S.connHeader}>
                  <EdgeArrowSvg edge={conn.edge} size={16} />
                  <span style={S.connTitle}>{targetName}{fromLabel}</span>
                  <span style={S.dimBadge}>{conn.freeTileCount}{conn.itemTileCount > 0 ? `+${conn.itemTileCount}` : ''}</span>
                </div>
                {conn.requirements.length > 0 && (
                  <div style={S.meta}>{conn.requirements.map(r => <ReqIcon key={r} req={r} />)}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ 6. ENTRANCES ═══ */}
      {renderResults.some(r => r.entrances.length > 0) && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Entrances</div>
          {renderResults.map(r => {
            if (r.entrances.length === 0) return null;
            const scrLabel = screenBundle?.isMulti
              ? (screenBundle.screenNames[r.screenIndex] ?? `0x${r.screenIndex.toString(16).toUpperCase()}`)
              : null;
            return (
              <div key={`ent-${r.screenIndex}`}>
                {scrLabel && <div style={{ ...S.meta, color: '#8cf', marginTop: 2 }}>{scrLabel}</div>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {r.entrances.map(ent => {
                  const t = r.transitions.find(t => t.entranceIdx === ent.id);
                  const entName = ENTRANCE_NAMES[ent.id] ?? null;
                  const isSyntheticIndoor = ent.id >= 1000 && isIndoors;
                  const entType = ent.id >= 1000
                    ? classifyEntranceFromRegion(roomIndex)
                    : classifyEntrance(ent.id);
                  const displayName = entName
                    ?? (isSyntheticIndoor
                      ? (SCREEN_NAMES[ent.area] ?? 'Overworld')
                      : `Room 0x${ent.roomId.toString(16).toUpperCase()}`);
                  const iconData = isSyntheticIndoor ? exitDoorIcon : ENTRANCE_ICONS[entType];
                  return (
                    <div key={`entrance-${ent.id}`} style={S.card}>
                      <div style={S.cardGraphic}>
                        <Icon icon={iconData} width={28} height={28} style={{ color: EDGE_COLORS.entrance }} />
                      </div>
                      <span style={S.cardTitle}>{displayName}</span>
                      <span style={S.cardSub}>#{ent.id}</span>
                      {t?.requirements && t.requirements.length > 0 && (
                        <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>{t.requirements.map(r => <ReqIcon key={r} req={r} />)}</div>
                      )}
                    </div>
                  );
                })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ 7. INTERNAL EDGES (multi-screen, diamond layout) ═══ */}
      {screenBundle?.isMulti && internalConnections.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Internal Edges</div>
          <InternalEdgeDiamond connections={internalConnections} screenBundle={screenBundle} />
        </div>
      )}

      {/* Review */}
      <StatusRow status={locationReview.status} comment={locationReview.comment} onStatus={setLocStatus} onComment={setLocComment} />
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

// ─── Entrance Icon Map (Iconify) ───────────────────────────────────────

const ENTRANCE_ICONS: Record<EntranceType, typeof woodenDoor> = {
  door: woodenDoor,
  cave: caveEntrance,
  hole: holeIcon,
  well: wellIcon,
  dungeon: dungeonGate,
  fairy: fairyIcon,
  shop: shopIcon,
  house: houseIcon,
  unknown: unknownIcon,
};

/** Classify entrance type from the room's region tags (for synthetic IDs ≥ 1000) */
function classifyEntranceFromRegion(roomIndex: number): EntranceType {
  const region = getRegionLookup().byCaveRoom.get(roomIndex);
  if (!region) return 'unknown';
  const tags = region.tags as readonly string[];
  if (tags.some(t => t === 'type:dungeon')) return 'dungeon';
  if (tags.some(t => t === 'type:shop')) return 'shop';
  if (tags.some(t => t === 'type:fairy')) return 'fairy';
  if (tags.some(t => t === 'type:house')) return 'house';
  if (tags.some(t => t === 'type:cave')) return 'cave';
  return 'door';
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

// ─── StatusRow ─────────────────────────────────────────────────────────

function StatusRow({ status, comment, onStatus, onComment }: { status: ReviewStatus; comment?: string; onStatus: (s: ReviewStatus) => void; onComment: (c: string) => void }) {
  return (
    <div>
      <div style={S.statusRow}>
        {STATUS_BTNS.map(b => (
          <button key={b.key} onClick={() => onStatus(b.key)} style={{ ...S.statusBtn, ...(status === b.key ? { color: b.color, borderColor: b.color } : {}) }}>
            {b.label}
          </button>
        ))}
      </div>
      {(status === 'bad' || status === 'yellow') && (
        <input style={S.commentInput} placeholder="Note..." value={comment ?? ''} onChange={e => onComment(e.target.value)} />
      )}
    </div>
  );
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
  const lockedPath = useConnectionOverlayStore(s => s.lockedPath);
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

function ScreenMapWithConnections({ bundle, connections, renderResults, linkScreenIndex }: {
  bundle: ScreenBundle;
  connections: ConnectionInfo[];
  renderResults: FloodFillResult[];
  linkScreenIndex: number | null;
}) {
  // Fill available width; cells are square (1:1 aspect like 512×512 screens)
  const EDGE_PAD = 18; // space for connection indicators + padding
  const GAP = 2;
  // Use CSS calc: container is 100% width, subtract edge padding to get grid area
  // We compute cell size assuming a fixed max widget width (~240px usable after root padding)
  const AVAIL = 224; // approx widget inner width minus root padding
  const CELL = Math.floor((AVAIL - EDGE_PAD * 2 - (bundle.cols - 1) * GAP) / bundle.cols);
  const gridW = bundle.cols * CELL + (bundle.cols - 1) * GAP;
  const gridH = bundle.rows * CELL + (bundle.rows - 1) * GAP;
  const totalW = gridW + EDGE_PAD * 2;
  const totalH = gridH + EDGE_PAD * 2;

  // Group connections by edge
  const byEdge: Record<string, ConnectionInfo[]> = { north: [], south: [], east: [], west: [] };
  for (const c of connections) {
    if (byEdge[c.edge]) byEdge[c.edge].push(c);
  }

  // Determine contrasting text color for each edge
  const textColor = (edge: string) => {
    // Dark backgrounds get white text, light ones get black
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
            left: EDGE_PAD + col * (CELL + GAP),
            top: EDGE_PAD + row * (CELL + GAP),
            width: CELL, height: CELL,
            borderRadius: 3, fontSize: 10, textAlign: 'center',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            background: isActive ? 'rgba(100,255,100,0.12)' : analyzed ? 'rgba(100,200,255,0.08)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isActive ? 'rgba(100,255,100,0.5)' : analyzed ? 'rgba(100,200,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: isActive ? '#8f8' : analyzed ? '#8cf' : '#666',
          }}>
            <div style={{ fontWeight: 700, fontSize: 11 }}>{bundle.subNames[scr] || bundle.screenNames[scr]}</div>
            <div style={{ color: '#555', fontSize: 9 }}>0x{scr.toString(16).toUpperCase()}</div>
            {scrResult && <div style={{ fontSize: 9, color: '#999' }}>{scrResult.reachableCount}/{scrResult.totalTiles}</div>}
          </div>
        );
      })}

      {/* Edge connection indicators — positioned by source screen's grid col/row */}
      {byEdge.north.map((c, i) => {
        const scrIdx = bundle.screens.indexOf(c.sourceScreen!);
        const col = scrIdx >= 0 ? scrIdx % bundle.cols : 0;
        const cellCenter = EDGE_PAD + col * (CELL + GAP) + CELL / 2;
        return (
          <div key={`n${i}`} style={{ position: 'absolute', top: 1, left: cellCenter - 9, width: 18, height: 14, borderRadius: 2, background: EDGE_COLORS.north, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={`${SCREEN_NAMES[c.targetScreen] ?? '0x' + c.targetScreen.toString(16)} (${c.positions.length}w)`}>
            <span style={{ fontSize: 10, fontWeight: 700, color: textColor('north'), lineHeight: 1 }}>{c.positions.length}</span>
          </div>
        );
      })}

      {byEdge.south.map((c, i) => {
        const scrIdx = bundle.screens.indexOf(c.sourceScreen!);
        const col = scrIdx >= 0 ? scrIdx % bundle.cols : 0;
        const cellCenter = EDGE_PAD + col * (CELL + GAP) + CELL / 2;
        return (
          <div key={`s${i}`} style={{ position: 'absolute', bottom: 1, left: cellCenter - 9, width: 18, height: 14, borderRadius: 2, background: EDGE_COLORS.south, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={`${SCREEN_NAMES[c.targetScreen] ?? '0x' + c.targetScreen.toString(16)} (${c.positions.length}w)`}>
            <span style={{ fontSize: 10, fontWeight: 700, color: textColor('south'), lineHeight: 1 }}>{c.positions.length}</span>
          </div>
        );
      })}

      {byEdge.west.map((c, i) => {
        const scrIdx = bundle.screens.indexOf(c.sourceScreen!);
        const row = scrIdx >= 0 ? Math.floor(scrIdx / bundle.cols) : 0;
        const cellCenter = EDGE_PAD + row * (CELL + GAP) + CELL / 2;
        return (
          <div key={`w${i}`} style={{ position: 'absolute', left: 1, top: cellCenter - 7, width: 16, height: 14, borderRadius: 2, background: EDGE_COLORS.west, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={`${SCREEN_NAMES[c.targetScreen] ?? '0x' + c.targetScreen.toString(16)} (${c.positions.length}w)`}>
            <span style={{ fontSize: 10, fontWeight: 700, color: textColor('west'), lineHeight: 1 }}>{c.positions.length}</span>
          </div>
        );
      })}

      {byEdge.east.map((c, i) => {
        const scrIdx = bundle.screens.indexOf(c.sourceScreen!);
        const row = scrIdx >= 0 ? Math.floor(scrIdx / bundle.cols) : 0;
        const cellCenter = EDGE_PAD + row * (CELL + GAP) + CELL / 2;
        return (
          <div key={`e${i}`} style={{ position: 'absolute', right: 1, top: cellCenter - 7, width: 16, height: 14, borderRadius: 2, background: EDGE_COLORS.east, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={`${SCREEN_NAMES[c.targetScreen] ?? '0x' + c.targetScreen.toString(16)} (${c.positions.length}w)`}>
            <span style={{ fontSize: 10, fontWeight: 700, color: textColor('east'), lineHeight: 1 }}>{c.positions.length}</span>
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
  statusRow: { display: 'flex', gap: 3, marginTop: 3 },
  statusBtn: {
    padding: '1px 6px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3,
    fontSize: 10, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', color: '#888', fontFamily: 'inherit',
  },
  commentInput: {
    width: '100%', padding: '2px 6px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 3, color: '#ccc',
    fontSize: 10, fontFamily: 'inherit', outline: 'none', marginTop: 3,
  },
};

export { NavigationWidgetContent };
