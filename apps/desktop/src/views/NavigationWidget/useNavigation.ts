/* @layer renderer-widgets @kind hook */
import { isAutoFlood } from '@app/startup/is-auto-flood';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useGameUIStore } from '../../stores/game-ui-store';
import { listedCrossings } from '@rotp/navigation';
import { annotateFlooded } from './nav-flood/annotate-flooded';
import { liveGameStates } from '@rotp/game-core';
import { useNavigationOverlayStore } from '../../stores/navigation-overlay-store';
import { useWidgetStateReady } from '@drizztdourden08/brock-react';
import { useWidgetPref } from '@drizztdourden08/brock-react';
import type { NavMode } from '../../stores/navigation-overlay-store';
import type { ConnectionInfo } from '@rotp/game-core';
import type { TileReq } from '@rotp/game-data';
import { wasmGetViewportInfo, wasmGetOverworldVariant, wasmGetProgressIndicator, wasmGetIndoorLayer0Grid, wasmGetLinkLayer, wasmGetOverworldEntrances, wasmGetFallHoles, wasmGetExitScreenMap, wasmGetRoomLayoutInfo, wasmGetDungeonMapPosition } from '../../game';
import type { OverworldVariantInfo } from '../../game';
import { enrichEntrances } from '@rotp/navigation';
import { useScreenDetection, usePlayerDebugState, useFloodOnTransition } from './hooks';
import { reassertFeatureFlags } from '../../game';
import { setDeveloperToolsOverride } from '@rotp/game-core';
import { buildInventory, computeStartContext } from './nav-flood/prepare';
import { collectIndoorEntrances } from './nav-flood/indoor-entrances';
import { propagateScreens } from './nav-flood/propagate';
import { collectScreenCrossings } from './nav-flood/collect-screen-crossings';
import { annotateLayerToggles, buildIndoorScreenBundle, computeFallHoleLandings } from './nav-flood/finalize';
import { useNavConnections } from './nav-flood/useNavConnections';
import { liveOverworldScreenOf } from './nav-flood/live-overworld-screen';

let didApplyAutoFloodFlag = false;

let didRestoreSavedMode = false;

const useNavigation = () => {
  const { overworldScreenIndex, roomIndex, isIndoors, isDarkWorld, palaceIndex, whichEntrance, linkX: playerX, linkY: playerY } = useGameUIStore(s => s.map);
  const equipment = useGameUIStore(s => s.equipment);
  const inventoryItems = useGameUIStore(s => s.inventory.items);
  const overlayStore = useNavigationOverlayStore();
  const { result, connections, screenBundle, respawnEntIds, crossings, mode, setScreenBundle } = overlayStore;
  const autoRun = mode === 'auto';

  const [savedMode, setSavedMode] = useWidgetPref<NavMode>('navigation', 'mode', 'manual');
  const prefsHydrated = useWidgetStateReady();

  const [running, setRunning] = useState(false);
  const [variant, setVariant] = useState<OverworldVariantInfo | null>(null);
  const [dynamicBlockerCount, setDynamicBlockerCount] = useState(0);
  const [, setVisibleScreenIndices] = useState<number[]>([]);
  const [debugTick, setDebugTick] = useState(0);
  const handleRunRef = useRef<(() => Promise<void>) | null>(null);
  const prevInventoryKeyRef = useRef<string | null>(null);

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

  const dungeonMapPos = useMemo(() => {
    if (!isIndoors || palaceIndex === 0xFF) return null;
    return wasmGetDungeonMapPosition();
  }, [isIndoors, roomIndex, palaceIndex, debugTick]);

  const roomLayoutInfo = useMemo(() => {
    if (!isIndoors) return null;
    return wasmGetRoomLayoutInfo();
  }, [isIndoors, roomIndex, debugTick]);

  const activeScreenIndex = isIndoors ? roomIndex : overworldScreenIndex;

  useEffect(() => {
    if (isIndoors) { setVariant(null); return; }
    const v = wasmGetOverworldVariant(overworldScreenIndex);
    setVariant(v);
  }, [overworldScreenIndex, isIndoors]);

  const detectionResult = useScreenDetection(debugTick);
  const progressInfo = wasmGetProgressIndicator();
  const gameStates = liveGameStates();
  const detectedScreen = detectionResult?.screen ?? null;
  const screenId = detectedScreen?.id ?? null;
  const screenName = detectedScreen?.name
    ?? (isIndoors ? `Room 0x${roomIndex.toString(16).toUpperCase().padStart(4, '0')}` : `Screen 0x${overworldScreenIndex.toString(16).toUpperCase().padStart(2, '0')}`);
  const displayedVariant = !isIndoors
    ? (result ? wasmGetOverworldVariant(result.screenIndex) : variant)
    : null;
  const renderResults = overlayStore.results;
  const reachableSum = renderResults.reduce((sum, r) => sum + r.reachableCount, 0);
  const totalTilesSum = renderResults.reduce((sum, r) => sum + r.totalTiles, 0);
  const entranceSum = crossings.reduce((sum, screen) => sum + listedCrossings(screen, isIndoors).length, 0);

  useEffect(() => {
    const id = setInterval(() => setDebugTick(t => (t + 1) & 1023), 200);
    return () => clearInterval(id);
  }, []);
  const playerDebug = usePlayerDebugState(debugTick);

  useEffect(() => {
    if (result && result.screenIndex !== activeScreenIndex) {
      overlayStore.clear();
      return;
    }
    if (screenBundle && !screenBundle.screens.includes(activeScreenIndex) && screenBundle.head !== activeScreenIndex) {
      setScreenBundle(null);
    }
  }, [activeScreenIndex]);

  const handleRun = useCallback(async () => {
    if (running) return;

    if (isIndoors) {
      const layer0 = wasmGetIndoorLayer0Grid();
      if (!layer0) return;
    }

    setRunning(true);
    try {
      const vp = wasmGetViewportInfo?.();
      const liveOverworldScreenIndex = vp ? liveOverworldScreenOf(vp.linkX, vp.linkY) : overworldScreenIndex;
      const primaryScreenIndex = isIndoors ? activeScreenIndex : liveOverworldScreenIndex;

      const items = buildInventory(equipment, inventoryItems);
      const { startPos } = computeStartContext({ vp, primaryScreenIndex, isIndoors });

      const allEntrances = enrichEntrances();
      const exitScreenByRoom = wasmGetExitScreenMap();

      const fallHoleEntIds = new Set<number>();
      { const holes = wasmGetFallHoles(); for (const h of holes) fallHoleEntIds.add(h.entranceId); }
      const overworldDoorEntIds = new Set<number>();
      { const owEntrances = wasmGetOverworldEntrances(); for (const e of owEntrances) overworldDoorEntIds.add(e.id); }

      const currentRespawnIds = isIndoors
        ? collectIndoorEntrances({ primaryScreenIndex, allEntrances, exitScreenByRoom, fallHoleEntIds, overworldDoorEntIds })
        : new Set<number>();

      const roomLayout = isIndoors ? wasmGetRoomLayoutInfo() : null;
      const intraEdges = roomLayout?.intraEdges ?? [];

      const { responses, overworldBundle } = propagateScreens({
        isIndoors, primaryScreenIndex, startPos, items, allEntrances, intraEdges,
      });
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

      if (isIndoors) {
        setScreenBundle(buildIndoorScreenBundle({ screenName, primaryScreenIndex, allConnections, roomLayout, intraEdges }));
      }

      setDynamicBlockerCount(responses.reduce((sum, x) => sum + (x.result.dynamicBlockerCells?.length ?? x.dynamicBlockers?.length ?? 0), 0));

      const fallHoleSpawns = computeFallHoleLandings(primaryScreenIndex, isIndoors);
      overlayStore.setData(primaryResult, allConnections, fillResults, fallHoleSpawns, currentRespawnIds);
      overlayStore.setCrossings(collectScreenCrossings({ isIndoors, responses, items: items as TileReq[] }));

      overlayStore.setAnnotations(annotateFlooded({ fillResults, isIndoors, primaryScreenIndex, primaryScreenId: detectedScreen?.id ?? null }));
    } catch (e) { console.error(e); }
    finally {
      setRunning(false);
    }
  }, [activeScreenIndex, isIndoors, overworldScreenIndex, running, equipment, roomIndex, variant, inventoryItems]);

  handleRunRef.current = handleRun;

  useEffect(() => {
    if (!prefsHydrated || didRestoreSavedMode) return;
    didRestoreSavedMode = true;
    if (savedMode !== mode) overlayStore.setMode(savedMode);
  }, [prefsHydrated, savedMode, mode]);

  useEffect(() => {
    if (!isAutoFlood() || didApplyAutoFloodFlag) return;
    if (activeScreenIndex === null || running) return;
    didApplyAutoFloodFlag = true;
    overlayStore.setMode('auto');
    handleRunRef.current?.();
  }, [activeScreenIndex, running]);

  useEffect(() => {
    if (!autoRun) return;
    setDeveloperToolsOverride(true);
    reassertFeatureFlags();
    return () => {
      setDeveloperToolsOverride(null);
      reassertFeatureFlags();
    };
  }, [autoRun]);

  useFloodOnTransition({
    enabled: autoRun,
    isIndoors,
    linkX: playerX,
    linkY: playerY,
    onTrigger: useCallback(() => { handleRunRef.current?.(); }, []),
  });

  useEffect(() => {
    if (!autoRun || running) return;
    const key = `${equipment.sword},${equipment.gloves},${equipment.boots ? 1 : 0},${equipment.flippers ? 1 : 0},${inventoryItems[2]},${inventoryItems[11]}`;
    if (prevInventoryKeyRef.current !== null && prevInventoryKeyRef.current !== key) {
      handleRunRef.current?.();
    }
    prevInventoryKeyRef.current = key;
  }, [autoRun, running, equipment, inventoryItems]);

  const handleClear = useCallback(() => { overlayStore.clear(); }, []);

  const setMode = useCallback((next: NavMode) => {
    overlayStore.setMode(next);
    setSavedMode(next);
    if (next === 'auto' && !running) handleRunRef.current?.();
  }, [running, setSavedMode]);

  const { externalConnections, internalConnections, externalEdges } = useNavConnections(connections, screenBundle, isIndoors, crossings);

  return {
    screenBundle, screenName, screenId, isIndoors, roomIndex, isDarkWorld, overworldScreenIndex, externalConnections, externalEdges, crossings, renderResults, playerDebug, respawnEntIds, palaceIndex, dungeonMapPos, roomLayoutInfo, whichEntrance, roomStartLayer, progressInfo, gameStates, displayedVariant, dynamicBlockerCount, playerX, playerY, running, handleRun, result, handleClear, overlayStore, mode, setMode, reachableSum, totalTilesSum, entranceSum, internalConnections,
  };
};

export { useNavigation };
