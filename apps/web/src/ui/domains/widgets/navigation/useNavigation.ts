/* @layer renderer-widgets @kind hook */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useGameUIStore } from '../../../../stores/game-ui-store';
import { usableEntrances } from '@shared/game/navigation';
import { displayName } from '@shared/game/data/screens';
import { annotateFlooded } from './nav-flood/annotate-flooded';
import { liveGameStates } from '../../../../lib/game/live-game-states';
import { useNavigationOverlayStore } from '../../../../stores/navigation-overlay-store';
import type { ScreenBundle, FloodFillResult, ConnectionInfo } from '@shared/game/navigation';
import { wasmGetViewportInfo, wasmGetOverworldVariant, wasmGetProgressIndicator, wasmGetIndoorLayer0Grid, wasmGetLinkLayer, wasmGetOverworldEntrances, wasmGetFallHoles, wasmGetExitScreenMap, wasmGetEntranceSpawns, wasmGetRoomLayoutInfo, wasmGetDungeonMapPosition } from '../../../../lib/game';
import type { OverworldVariantInfo } from '../../../../lib/game';
import { enrichEntrances } from './widget-helpers';
import { useScreenDetection, usePlayerDebugState, useAutoFloodTrigger } from './hooks';
import { buildInventory, buildOverworldBlockers, computeStartContext } from './nav-flood/prepare';
import { collectIndoorEntrances } from './nav-flood/indoor-entrances';
import { propagateScreens } from './nav-flood/propagate';
import { annotateLayerToggles, buildIndoorScreenBundle, computeFallHoleLandings } from './nav-flood/finalize';
import { useNavConnections } from './nav-flood/use-nav-connections';

/** All Navigation-widget state, data acquisition, and flood-fill orchestration. */
const useNavigation = () => {
  const { overworldScreenIndex, roomIndex, isIndoors, isDarkWorld, palaceIndex, whichEntrance, linkX: playerX, linkY: playerY } = useGameUIStore(s => s.map);
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

  // Capture the player's layer at the moment a room loads (the "starting layer" for this room visit)
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
  }, [isIndoors, roomIndex, palaceIndex, debugTick]);

  const roomLayoutInfo = useMemo(() => {
    if (!isIndoors) return null;
    return wasmGetRoomLayoutInfo();
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
  const gameStates = liveGameStates();
  const detectedScreen = detectionResult?.screen ?? null;
  const screenName = (detectedScreen && displayName(detectedScreen.id, detectedScreen.name))
    ?? (isIndoors ? `Room 0x${roomIndex.toString(16).toUpperCase().padStart(4, '0')}` : `Screen 0x${overworldScreenIndex.toString(16).toUpperCase().padStart(2, '0')}`);
  const displayedVariant = !isIndoors
    ? (result ? wasmGetOverworldVariant(result.screenIndex) : variant)
    : null;
  const renderResults = overlayStore.results.length > 0
    ? overlayStore.results
    : (result ? [result] : []);
  const reachableSum = renderResults.reduce((sum, r) => sum + r.reachableCount, 0);
  const totalTilesSum = renderResults.reduce((sum, r) => sum + r.totalTiles, 0);
  const entranceSum = renderResults.reduce((sum, r) => sum + usableEntrances(r).length, 0);

  // Force a lightweight periodic rerender so live debug values update while moving.
  useEffect(() => {
    const id = setInterval(() => setDebugTick(t => (t + 1) & 1023), 200);
    return () => clearInterval(id);
  }, []);
  const playerDebug = usePlayerDebugState(debugTick);

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

  // Run flood fill — orchestrates the nav-flood/* helpers.
  const handleRun = useCallback(async () => {
    if (running) return;

    // For indoor rooms, bail early if tile data isn't available yet (transition in progress).
    if (isIndoors) {
      const layer0 = wasmGetIndoorLayer0Grid();
      if (!layer0) return; // Auto-trigger hook will retry on next tick
    }

    setRunning(true);
    try {
      const vp = wasmGetViewportInfo?.();
      const liveOverworldScreenIndex = vp
        ? ((((vp.linkY >> 9) & 7) << 3) | ((vp.linkX >> 9) & 7))
        : overworldScreenIndex;
      const primaryScreenIndex = isIndoors ? activeScreenIndex : liveOverworldScreenIndex;

      const items = buildInventory(equipment, inventoryItems);
      const blockerWorldPoints = isIndoors ? [] : buildOverworldBlockers();
      const { startPos, tileContext, rawAttrGrid, dualLayerGrids, playerLayer } = computeStartContext({ vp, primaryScreenIndex, isIndoors });

      // Get entrance data + exit map from WASM (cached per run)
      const allEntrances = enrichEntrances();
      const exitScreenByRoom = wasmGetExitScreenMap();

      // Fall-hole entrance IDs (excluded from regular markers) + overworld door IDs (physical doors).
      const fallHoleEntIds = new Set<number>();
      { const holes = wasmGetFallHoles(); for (const h of holes) fallHoleEntIds.add(h.entranceId); }
      const overworldDoorEntIds = new Set<number>();
      { const owEntrances = wasmGetOverworldEntrances(); for (const e of owEntrances) overworldDoorEntIds.add(e.id); }

      const currentRespawnIds = isIndoors
        ? collectIndoorEntrances({ primaryScreenIndex, allEntrances, exitScreenByRoom, fallHoleEntIds, overworldDoorEntIds })
        : new Set<number>();

      // Get room layout info for intra-room edge detection (indoor only)
      const roomLayout = isIndoors ? wasmGetRoomLayoutInfo() : null;
      const intraEdges = roomLayout?.intraEdges ?? [];

      const { responses, overworldBundle } = propagateScreens({
        isIndoors, primaryScreenIndex, startPos, rawAttrGrid, items, tileContext,
        allEntrances, exitScreenByRoom, intraEdges, dualLayerGrids, playerLayer, blockerWorldPoints,
      });
      // Outdoors: set bundle before the early-return so it persists even with no reachable screens.
      if (overworldBundle) setScreenBundle(overworldBundle);
      if (responses.length === 0) return;

      setVisibleScreenIndices(responses.map(r => r.screenIndex).sort((a, b) => a - b));

      const fillResults = responses.map(r => r.result);
      const primaryResult = fillResults.find(r => r.screenIndex === primaryScreenIndex) ?? fillResults[0];

      const allConnections: ConnectionInfo[] = [];
      for (const r of responses) {
        for (const c of r.connections) {
          allConnections.push({ ...c, sourceScreen: r.screenIndex });
        }
      }

      annotateLayerToggles(allConnections, isIndoors);

      // Build indoor screen bundle now that we know which edges were found
      if (isIndoors) {
        setScreenBundle(buildIndoorScreenBundle({ screenName, primaryScreenIndex, allConnections, roomLayout, intraEdges }));
      }

      setDynamicBlockerCount(responses.reduce((sum, x) => sum + (x.result.dynamicBlockerCells?.length ?? x.dynamicBlockers?.length ?? 0), 0));
      setResult(primaryResult);
      setConnections(allConnections);

      const fallHoleSpawns = computeFallHoleLandings(primaryScreenIndex, isIndoors);
      setFallHoleLandings(fallHoleSpawns);
      setRespawnEntIds(currentRespawnIds);

      overlayStore.setData(primaryResult, allConnections, fillResults, fallHoleSpawns, currentRespawnIds);

      // Derived from the same reads the run gates on, so the overlay and the run
      // can never describe a screen differently.
      overlayStore.setAnnotations(annotateFlooded({ fillResults, isIndoors, primaryScreenIndex, startPos, primaryScreenId: detectedScreen?.id ?? null }));
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

  // Derived: classify connections as internal vs external (with dedup).
  const { externalConnections, internalConnections } = useNavConnections(connections, screenBundle, isIndoors);

  // Entrance spawn data for showing starting layer per entrance
  const entranceSpawns = wasmGetEntranceSpawns();

  return {
    screenBundle, screenName, isIndoors, roomIndex, isDarkWorld, overworldScreenIndex, externalConnections, renderResults, playerDebug, respawnEntIds, palaceIndex, dungeonMapPos, roomLayoutInfo, whichEntrance, roomStartLayer, progressInfo, gameStates, displayedVariant, dynamicBlockerCount, playerX, playerY, running, handleRun, result, toggleOverlay, overlayStore, autoRun, setAutoRun, reachableSum, totalTilesSum, entranceSum, internalConnections, fallHoleLandings, entranceSpawns,
  };
};

export { useNavigation };
