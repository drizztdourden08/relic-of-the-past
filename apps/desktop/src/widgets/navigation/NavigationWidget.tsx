/**
 * NavigationWidgetContent — "Location & Navigation" widget.
 *
 * Shows current overworld location info + connections with review controls.
 * Triggers flood-fill analysis and drives the in-game overlay.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameUIStore } from '../../stores/game-ui-store';
import { useConnectionOverlayStore } from '../../stores/connection-overlay-store';
import { SCREEN_NAMES } from '@shared/game/navigation';
import { wasmGetViewportInfo, wasmGetOverworldVariant, wasmGetIndoorAttrGrid, wasmGetIndoorUncleBlockers, wasmGetLiveSprites, wasmGetOverworldGuardSpawns } from '../../lib/game';
import type { OverworldVariantInfo } from '../../lib/game';
import type { TileAttrContext } from '@shared/game/navigation/tile-attrs';
import { NavReviewPanel } from './NavReviewPanel';
import type { BorderBundle } from './NavReviewPanel';
import type { FloodFillResult, ConnectionInfo } from '@shared/game/navigation';

type ReviewStatus = 'neutral' | 'good' | 'bad' | 'yellow';
interface ReviewEntry { status: ReviewStatus; comment?: string; }
interface LocationReview { status: ReviewStatus; comment?: string; connections: Record<string, ReviewEntry>; }
type ReviewData = Record<string, LocationReview>;

const EDGE_COLORS: Record<string, string> = {
  north: '#4488ff', south: '#44ff88', east: '#ff8844', west: '#bb44ff', entrance: '#ffcc44',
};
const EDGE_ARROWS: Record<string, string> = {
  north: '⬆', south: '⬇', east: '➡', west: '⬅',
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
  const { overworldScreenIndex, roomIndex, isIndoors, isDarkWorld } = useGameUIStore(s => s.map);
  const equipment = useGameUIStore(s => s.equipment);
  const inventoryItems = useGameUIStore(s => s.inventory.items);
  const overlayStore = useConnectionOverlayStore();
  const [reviewData, setReviewData] = useState<ReviewData>({});
  const [result, setResult] = useState<FloodFillResult | null>(null);
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [bundles, setBundles] = useState<BorderBundle[]>([]);
  const [running, setRunning] = useState(false);
  const [autoRun, setAutoRun] = useState(false);
  const [variant, setVariant] = useState<OverworldVariantInfo | null>(null);
  const [dynamicBlockerCount, setDynamicBlockerCount] = useState(0);
  const [visibleScreenIndices, setVisibleScreenIndices] = useState<number[]>([]);
  const [debugTick, setDebugTick] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevScreenRef = useRef<number | null>(null);
  const prevLiveOverworldScreenRef = useRef<number | null>(null);
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
    ? `Room 0x${roomIndex.toString(16).toUpperCase()}`
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
  const visibleScreenLabel = visibleScreenIndices
    .map(i => `0x${i.toString(16).toUpperCase()}`)
    .join(', ');
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
          if (rawAttrGrid) {
            const blockers = wasmGetIndoorUncleBlockers();
            const roomWorldX = Math.floor(vp.linkX / 512) * 512;
            const roomWorldY = Math.floor(vp.linkY / 512) * 512;
            for (const b of blockers) {
              const c0 = Math.floor((b.x - roomWorldX) / 8);
              const r0 = Math.floor((b.y - roomWorldY) / 8);
              for (let dr = 0; dr < 2; dr++) {
                for (let dc = 0; dc < 2; dc++) {
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
      // to adjacent screens via border transitions until no new screens are discovered.
      // Each screen is run with ALL accumulated border entry points as extra seeds,
      // handling disconnected regions (e.g., 0x1B has east/west halves separated by walls).
      const MAX_SCREENS = 9;
      const MAX_ITERATIONS = 8;
      let iterations = 0;
      const analyzed = new Map<number, Awaited<ReturnType<typeof runOne>>>();
      // Accumulate all entry points per pending screen
      const pendingSeeds = new Map<number, { row: number; col: number }[]>();
      pendingSeeds.set(primaryScreenIndex, [startPos!]);

      while (pendingSeeds.size > 0 && analyzed.size < MAX_SCREENS && iterations < MAX_ITERATIONS) {
        iterations++;

        // Run all pending screens with their accumulated seeds
        const batch = [...pendingSeeds.entries()].slice(0, MAX_SCREENS - analyzed.size);
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
            if (!analyzed.has(adjScreen)) {
              // Add to pending seeds (accumulates multiple entries per screen)
              const existing = pendingSeeds.get(adjScreen) ?? [];
              existing.push(entryPos);
              pendingSeeds.set(adjScreen, existing);
            }
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
      const primaryResp = normalized.find(x => x.resp.screenIndex === primaryResult.screenIndex)!.resp;

      setDynamicBlockerCount(normalized.reduce((sum, x) => sum + (x.resp.dynamicBlockerCells?.length ?? x.dynamicBlockers?.length ?? 0), 0));
      setResult(primaryResult);
      setConnections(primaryResp.connections);
      setBundles(primaryResp.bundles ?? []);
      overlayStore.setData(primaryResult, primaryResp.connections, fillResults);
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
      pendingAutoSecondPassRef.current = true;
      handleRunRef.current?.();
    }
    prevScreenRef.current = activeScreenIndex;
  }, [autoRun, activeScreenIndex, romFile, running, handleRun]);

  useEffect(() => {
    if (!autoRun || !romFile || running || isIndoors) return;
    const vp = wasmGetViewportInfo?.();
    if (!vp) return;
    const liveScreen = (((vp.linkY >> 9) & 7) << 3) | ((vp.linkX >> 9) & 7);
    if (prevLiveOverworldScreenRef.current !== null && prevLiveOverworldScreenRef.current !== liveScreen) {
      pendingAutoSecondPassRef.current = true;
      handleRunRef.current?.();
    }
    prevLiveOverworldScreenRef.current = liveScreen;
  }, [autoRun, romFile, running, isIndoors, debugTick]);

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

  return (
    <div style={S.root}>
      {/* Location header */}
      <div style={S.section}>
        <div style={S.locName}>{screenName}</div>
        <div style={S.meta}>
          {locationKey} · {isIndoors ? 'INDOOR' : (isDarkWorld ? 'DW' : 'LW')}
          {!isIndoors && ` · R${(overworldScreenIndex >> 3) & 7} C${overworldScreenIndex & 7}`}
          {isIndoors && ' · (indoors)'}
        </div>
        {!isIndoors && visibleScreenIndices.length > 1 && (
          <div style={{ ...S.meta, color: '#6ef' }}>Live screens: {visibleScreenLabel}</div>
        )}
        {displayedVariant && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 3, padding: '4px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 9 }}>
              <span style={{ color: '#999' }}>Progress: </span>
              <span style={{ color: '#fc6' }}>{displayedVariant.phaseLabel}</span>
            </div>
            <div style={{ fontSize: 9 }}>
              <span style={{ color: '#999' }}>Screen Tile Patch (bit 0x20): </span>
              {displayedVariant.eventOverlayActive
                ? <span style={{ color: '#4f8' }}>present ✓</span>
                : <span style={{ color: '#a66' }}>none</span>}
            </div>
            <div style={{ fontSize: 9 }}>
              <span style={{ color: '#999' }}>Flags: </span>
              <span style={{ color: '#aac' }}>0x{displayedVariant.screenEventFlags.toString(16).padStart(2, '0')}</span>
            </div>
            <div style={{ fontSize: 9 }}>
              <span style={{ color: '#999' }}>Dynamic NPC Blockers: </span>
              <span style={{ color: dynamicBlockerCount > 0 ? '#fc6' : '#7aa' }}>{dynamicBlockerCount}</span>
            </div>
          </div>
        )}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 3, padding: '4px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 9 }}>
              <span style={{ color: '#999' }}>Reachable: </span>
              <span style={{ color: '#ccc' }}>{reachableSum}/{totalTilesSum} ({totalTilesSum > 0 ? (reachableSum / totalTilesSum * 100).toFixed(0) : '0'}%)</span>
            </div>
            <div style={{ fontSize: 9 }}>
              <span style={{ color: '#999' }}>Entrances: </span>
              <span style={{ color: '#ccc' }}>{entranceSum}</span>
            </div>
            <div style={{ fontSize: 9 }}>
              <span style={{ color: '#999' }}>Connections: </span>
              <span style={{ color: '#ccc' }}>{connections.length}</span>
            </div>
            {!isIndoors && renderResults.length > 1 && (
              <div style={{ fontSize: 9 }}>
                <span style={{ color: '#999' }}>Analyzed screens: </span>
                <span style={{ color: '#ccc' }}>{renderResults.length}</span>
              </div>
            )}
          </div>
        )}
        {linkDebug && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 3, padding: '4px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 9 }}>
              <span style={{ color: '#999' }}>Link: </span>
              <span style={{ color: '#7f7' }}>({linkDebug.linkX}, {linkDebug.linkY}) rel:({linkDebug.relX}, {linkDebug.relY})</span>
            </div>
            <div style={{ fontSize: 9 }}>
              <span style={{ color: '#999' }}>Sub-tiles: </span>
              <span style={{ color: '#7f7' }}>c{linkDebug.tileMinCol}-{linkDebug.tileMaxCol} r{linkDebug.tileMinRow}-{linkDebug.tileMaxRow}</span>
              <span style={{ color: '#666' }}> | </span>
              <span style={{ color: '#7f7' }}>Map16: ({linkDebug.map16Row},{linkDebug.map16Col})</span>
              <span style={{ color: '#666' }}> | </span>
              <span style={{ color: '#7f7' }}>Live screen: 0x{linkDebug.liveScreenIndex.toString(16).toUpperCase()}</span>
            </div>
          </div>
        )}
        <StatusRow status={locationReview.status} comment={locationReview.comment} onStatus={setLocStatus} onComment={setLocComment} />
      </div>

      {/* Actions */}
      <div style={S.actions}>
        <button style={{ ...S.btn, ...(running ? S.btnDisabled : {}) }} onClick={handleRun} disabled={running || !romFile}>
          {running ? '⏳' : '▶'} Flood Fill
        </button>
        <button style={{ ...S.btn, ...(result ? {} : S.btnDisabled) }} onClick={toggleOverlay} disabled={!result}>
          {overlayStore.visible ? '👁 Hide' : '👁 Show'} Overlay
        </button>
        <button style={{ ...S.btn, ...(autoRun ? S.btnActive : {}) }} onClick={() => setAutoRun(a => !a)}>
          {autoRun ? '⟳ Auto' : '⟳ Auto'}
        </button>
      </div>

      {/* Tile Recorder */}
      <TileRecorder attrGrid={result?.attrGrid ?? null} overworldScreenIndex={overworldScreenIndex} />

      {/* Connections */}
      {connections.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Connections</div>
          {connections.map(conn => {
            const connKey = `${conn.edge}-${conn.targetScreen.toString(16)}`;
            const review = locationReview.connections[connKey] ?? { status: 'neutral' as ReviewStatus };
            const targetName = SCREEN_NAMES[conn.targetScreen] ?? `0x${conn.targetScreen.toString(16).toUpperCase()}`;
            return (
              <div key={connKey} style={S.connCard}>
                <div style={S.connHeader}>
                  <span style={{ ...S.dot, background: EDGE_COLORS[conn.edge] }} />
                  <span style={S.connTitle}>{EDGE_ARROWS[conn.edge]} {targetName}</span>
                  <span style={S.dimBadge}>
                    {conn.edge === 'north' || conn.edge === 'south'
                      ? `${conn.positions.length}×1`
                      : `1×${conn.positions.length}`}
                  </span>
                </div>
                <div style={S.meta}>
                  {conn.freeTileCount} free{conn.itemTileCount > 0 ? ` + ${conn.itemTileCount} gated` : ''}
                  {conn.requirements.length > 0 && ` · ${conn.requirements.join(', ')}`}
                </div>
                <StatusRow status={review.status} comment={review.comment} onStatus={s => setConnStatus(connKey, s)} onComment={c => setConnComment(connKey, c)} />
              </div>
            );
          })}
        </div>
      )}

      {/* Entrances */}
      {result && result.entrances.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Entrances</div>
          {result.entrances.map(ent => {
            const connKey = `entrance-${ent.id}`;
            const review = locationReview.connections[connKey] ?? { status: 'neutral' as ReviewStatus };
            const t = result.transitions.find(t => t.entranceIdx === ent.id);
            return (
              <div key={connKey} style={S.connCard}>
                <div style={S.connHeader}>
                  <span style={{ ...S.dot, background: EDGE_COLORS.entrance }} />
                  <span style={S.connTitle}>Room 0x{ent.roomId.toString(16).toUpperCase()} (#{ent.id})</span>
                  <span style={S.dimBadge}>2×2</span>
                </div>
                <div style={S.meta}>
                  ({ent.gridRow},{ent.gridCol})
                  {t?.requirements.length ? ` · needs: ${t.requirements.join(', ')}` : ' · free'}
                </div>
                <StatusRow status={review.status} comment={review.comment} onStatus={s => setConnStatus(connKey, s)} onComment={c => setConnComment(connKey, c)} />
              </div>
            );
          })}
        </div>
      )}

      {/* Nav Review Panel — connection point detail with per-bundle review */}
      {result && bundles.length > 0 && (
        <div style={S.section}>
          <NavReviewPanel
            locationKey={locationKey}
            bundles={bundles}
            entrances={result.entrances}
            transitions={result.transitions}
            borders={result.borders}
            reachableCount={result.reachableCount}
            totalTiles={result.totalTiles}
          />
        </div>
      )}
    </div>
  );
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

// ─── TileRecorder ──────────────────────────────────────────────────────

interface TileRecord { row: number; col: number; attr: number; }

function TileRecorder({ attrGrid, overworldScreenIndex }: { attrGrid: number[][] | null; overworldScreenIndex: number }) {
  const [recording, setRecording] = useState(false);
  const [tiles, setTiles] = useState<TileRecord[]>([]);
  const lastTile = useRef<string>('');
  const rafRef = useRef<number>(0);
  const lockedPath = useConnectionOverlayStore(s => s.lockedPath);

  useEffect(() => {
    if (!recording || !attrGrid) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const poll = () => {
      const vp = wasmGetViewportInfo();
      if (vp && vp.locationModule === 9) {
        // Link's position within this screen's grid
        const screenCol = overworldScreenIndex & 7;
        const screenRow = (overworldScreenIndex >> 3) & 7;
        const screenWorldX = screenCol * 512;
        const screenWorldY = screenRow * 512;

        const tileCol = Math.floor((vp.linkX - screenWorldX) / 8);
        const tileRow = Math.floor((vp.linkY - screenWorldY) / 8);

        if (tileRow >= 0 && tileRow < 64 && tileCol >= 0 && tileCol < 64) {
          const key = `${tileRow},${tileCol}`;
          if (key !== lastTile.current) {
            lastTile.current = key;
            const attr = attrGrid[tileRow][tileCol];
            setTiles(prev => [...prev, { row: tileRow, col: tileCol, attr }]);
          }
        }
      }
      rafRef.current = requestAnimationFrame(poll);
    };

    rafRef.current = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafRef.current);
  }, [recording, attrGrid, overworldScreenIndex]);

  const toggle = () => {
    if (recording) {
      setRecording(false);
    } else {
      setTiles([]);
      lastTile.current = '';
      setRecording(true);
    }
  };

  return (
    <div style={S.section}>
      <div style={S.sectionTitle}>Tile Recorder</div>
      <div style={S.actions}>
        <button style={{ ...S.btn, ...(attrGrid ? {} : S.btnDisabled) }} onClick={toggle} disabled={!attrGrid}>
          {recording ? '⏹ Stop' : '⏺ Record'}
        </button>
        {tiles.length > 0 && !recording && (
          <button style={S.btn} onClick={() => { navigator.clipboard.writeText(tiles.map(t => `[${t.row},${t.col}] 0x${t.attr.toString(16).padStart(2, '0')}`).join('\n')); }}>
            📋 Copy
          </button>
        )}
        {lockedPath && lockedPath.length > 0 && (
          <button style={S.btn} onClick={() => { navigator.clipboard.writeText(lockedPath.map((t, i) => `${i}: [${t.row},${t.col}] 0x${t.attr.toString(16).padStart(2, '0')}`).join('\n')); }}>
            📋 Path
          </button>
        )}
      </div>
      {tiles.length > 0 && (
        <div style={{ ...S.meta, maxHeight: 120, overflowY: 'auto', whiteSpace: 'pre', fontFamily: 'monospace', marginTop: 3 }}>
          {tiles.map((t, i) => (
            <div key={i} style={{ color: t.attr === 0x00 ? '#8f8' : t.attr === 0x01 ? '#f88' : '#ff8' }}>
              {i}: [{t.row},{t.col}] 0x{t.attr.toString(16).padStart(2, '0')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  root: {
    background: 'rgba(0,0,0,0.8)',
    color: '#ccc',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    lineHeight: '14px',
    padding: '6px 8px',
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  section: { display: 'flex', flexDirection: 'column', gap: 3 },
  sectionTitle: { fontSize: 9, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1, paddingTop: 4 },
  locName: { fontSize: 12, fontWeight: 700, color: '#fff' },
  meta: { fontSize: 9, color: '#888' },
  actions: { display: 'flex', gap: 4 },
  btn: {
    padding: '3px 8px', background: 'rgba(100,200,100,0.12)', border: '1px solid rgba(100,200,100,0.35)',
    borderRadius: 3, color: '#8f8', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
  btnDisabled: { opacity: 0.35, cursor: 'not-allowed' },
  btnActive: { background: 'rgba(100,200,255,0.18)', borderColor: 'rgba(100,200,255,0.5)', color: '#8cf' },
  connCard: { display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 6px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', marginTop: 2 },
  connHeader: { display: 'flex', alignItems: 'center', gap: 5 },
  connTitle: { fontSize: 10, fontWeight: 600, color: '#ddd' },
  dimBadge: { fontSize: 8, padding: '0 4px', borderRadius: 3, background: 'rgba(255,255,255,0.06)', color: '#888', marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" },
  dot: { width: 8, height: 8, borderRadius: 2, flexShrink: 0 },
  statusRow: { display: 'flex', gap: 3, marginTop: 3 },
  statusBtn: {
    padding: '1px 6px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3,
    fontSize: 9, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', color: '#888', fontFamily: 'inherit',
  },
  commentInput: {
    width: '100%', padding: '2px 6px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 3, color: '#ccc',
    fontSize: 9, fontFamily: 'inherit', outline: 'none', marginTop: 3,
  },
};

export { NavigationWidgetContent };
