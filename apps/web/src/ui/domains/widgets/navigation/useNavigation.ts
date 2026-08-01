/* @layer renderer-widgets @kind hook */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useGameUIStore } from '../../../../stores/game-ui-store';
import { usableEntrances } from '@shared/game/navigation';
import { annotateFlooded } from './nav-flood/annotate-flooded';
import { liveGameStates } from '../../../../lib/game/live-game-states';
import { useNavigationOverlayStore } from '../../../../stores/navigation-overlay-store';
import type { NavMode } from '../../../../stores/navigation-overlay-store';
import type { ConnectionInfo } from '@shared/game/navigation';
import { wasmGetViewportInfo, wasmGetOverworldVariant, wasmGetProgressIndicator, wasmGetIndoorLayer0Grid, wasmGetLinkLayer, wasmGetOverworldEntrances, wasmGetFallHoles, wasmGetExitScreenMap, wasmGetEntranceSpawns, wasmGetRoomLayoutInfo, wasmGetDungeonMapPosition } from '../../../../lib/game';
import type { OverworldVariantInfo } from '../../../../lib/game';
import { enrichEntrances } from './widget-helpers';
import { useScreenDetection, usePlayerDebugState, useFloodOnTransition } from './hooks';
import { buildInventory, computeStartContext } from './nav-flood/prepare';
import { collectIndoorEntrances } from './nav-flood/indoor-entrances';
import { propagateScreens } from './nav-flood/propagate';
import { annotateLayerToggles, buildIndoorScreenBundle, computeFallHoleLandings } from './nav-flood/finalize';
import { useNavConnections } from './nav-flood/use-nav-connections';

/** Set once per app run, so remounting the widget cannot re-apply the --auto-flood flag. */
let didApplyAutoFloodFlag = false;

/** All Navigation-widget state, data acquisition, and flood-fill orchestration. */
const useNavigation = () => {
  const { overworldScreenIndex, roomIndex, isIndoors, isDarkWorld, palaceIndex, whichEntrance, linkX: playerX, linkY: playerY } = useGameUIStore(s => s.map);
  const equipment = useGameUIStore(s => s.equipment);
  const inventoryItems = useGameUIStore(s => s.inventory.items);
  const overlayStore = useNavigationOverlayStore();
  // Flood output is READ from the store, never mirrored into component state. The widget
  // unmounts whenever the hub opens, and a local copy would leave with it, which is how
  // the minimap used to disappear while the overlay survived.
  const { result, connections, screenBundle, respawnEntIds, mode, setScreenBundle } = overlayStore;
  const fallHoleLandings = overlayStore.fallHoleSpawns;
  const autoRun = mode === 'auto';

  const [running, setRunning] = useState(false);
  const [variant, setVariant] = useState<OverworldVariantInfo | null>(null);
  const [dynamicBlockerCount, setDynamicBlockerCount] = useState(0);
  const [visibleScreenIndices, setVisibleScreenIndices] = useState<number[]>([]);
  const [debugTick, setDebugTick] = useState(0);
  const handleRunRef = useRef<(() => Promise<void>) | null>(null);
  const prevInventoryKeyRef = useRef<string | null>(null);

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
  const screenId = detectedScreen?.id ?? null;
  const screenName = (detectedScreen && (detectedScreen.vanillaName ?? detectedScreen.randomizerName))
    ?? (isIndoors ? `Room 0x${roomIndex.toString(16).toUpperCase().padStart(4, '0')}` : `Screen 0x${overworldScreenIndex.toString(16).toUpperCase().padStart(2, '0')}`);
  const displayedVariant = !isIndoors
    ? (result ? wasmGetOverworldVariant(result.screenIndex) : variant)
    : null;
  const renderResults = overlayStore.results;
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
      overlayStore.clear();
      return; // clear() already dropped the bundle
    }
    // Drop a screen bundle that no longer covers where the player is.
    if (screenBundle && !screenBundle.screens.includes(activeScreenIndex) && screenBundle.head !== activeScreenIndex) {
      setScreenBundle(null);
    }
  }, [activeScreenIndex]);

  // Run flood fill — orchestrates the nav-flood/* helpers.
  const handleRun = useCallback(async () => {
    if (running) return;

    // For indoor rooms, bail early if tile data isn't available yet (transition in progress).
    // The transition-settled event only fires once the game itself considers the room
    // settled, so this should be unreachable from that path; it still guards the manual
    // button, the CLI auto-flood flag, and the inventory-change trigger.
    if (isIndoors) {
      const layer0 = wasmGetIndoorLayer0Grid();
      if (!layer0) return;
    }

    setRunning(true);
    try {
      const vp = wasmGetViewportInfo?.();
      const liveOverworldScreenIndex = vp
        ? ((((vp.linkY >> 9) & 7) << 3) | ((vp.linkX >> 9) & 7))
        : overworldScreenIndex;
      const primaryScreenIndex = isIndoors ? activeScreenIndex : liveOverworldScreenIndex;

      const items = buildInventory(equipment, inventoryItems);
      const { startPos } = computeStartContext({ vp, primaryScreenIndex, isIndoors });

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
        isIndoors, primaryScreenIndex, startPos, items, allEntrances, intraEdges,
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

      const fallHoleSpawns = computeFallHoleLandings(primaryScreenIndex, isIndoors);
      overlayStore.setData(primaryResult, allConnections, fillResults, fallHoleSpawns, currentRespawnIds);

      // Derived from the same reads the run gates on, so the overlay and the run
      // can never describe a screen differently.
      overlayStore.setAnnotations(annotateFlooded({ fillResults, isIndoors, primaryScreenIndex, startPos, primaryScreenId: detectedScreen?.id ?? null }));
    } catch (e) { console.error(e); }
    finally {
      setRunning(false);
    }
  }, [activeScreenIndex, isIndoors, overworldScreenIndex, running, equipment, roomIndex, variant, inventoryItems]);

  handleRunRef.current = handleRun;

  // Auto-flood CLI flag: put the widget in auto mode and take the first flood once the
  // active screen is known. The guard is module-level, not a ref: a ref resets when the
  // hub unmounts the widget, which would force auto back on after the user chose manual.
  useEffect(() => {
    if (!window.api.autoFlood || didApplyAutoFloodFlag) return;
    if (activeScreenIndex === null || running) return;
    didApplyAutoFloodFlag = true;
    overlayStore.setMode('auto');
    handleRunRef.current?.();
  }, [activeScreenIndex, running]);

  // Auto-trigger: re-flood on transition-settled events (indoor) and live position
  // (overworld screen crossing). See useFloodOnTransition for why the split is real, not
  // a leftover of the old polling design.
  useFloodOnTransition({
    enabled: autoRun,
    isIndoors,
    linkX: playerX,
    linkY: playerY,
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

  /** Drop the flood: overlay, minimap group, annotations and stats all go at once. */
  const handleClear = useCallback(() => { overlayStore.clear(); }, []);

  /** Switching to auto floods straight away, so the overlay matches the mode you just picked. */
  const setMode = useCallback((next: NavMode) => {
    overlayStore.setMode(next);
    if (next === 'auto' && !running) handleRunRef.current?.();
  }, [running]);

  // Derived: classify connections as internal vs external (with dedup).
  const { externalConnections, internalConnections } = useNavConnections(connections, screenBundle, isIndoors);

  // Entrance spawn data for showing starting layer per entrance
  const entranceSpawns = wasmGetEntranceSpawns();

  return {
    screenBundle, screenName, screenId, isIndoors, roomIndex, isDarkWorld, overworldScreenIndex, externalConnections, renderResults, playerDebug, respawnEntIds, palaceIndex, dungeonMapPos, roomLayoutInfo, whichEntrance, roomStartLayer, progressInfo, gameStates, displayedVariant, dynamicBlockerCount, playerX, playerY, running, handleRun, result, handleClear, overlayStore, mode, setMode, reachableSum, totalTilesSum, entranceSum, internalConnections, fallHoleLandings, entranceSpawns,
  };
};

export { useNavigation };
