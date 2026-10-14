/* @layer renderer-widgets @kind hook */
import { useEffect, useCallback, useRef } from 'react';
import { useGameUIStore } from '../../../stores/game-ui-store';
import { listedCrossings } from '@rotp/navigation';
import { liveGameStates } from '@rotp/game-core';
import { useNavigationOverlayStore } from '../../../stores/navigation-overlay-store';
import { wasmGetProgressIndicator } from '../../../game';
import { useScreenDetection, usePlayerDebugState } from './';
import { useNavConnections } from '../../../nav-widget/nav-flood/useNavConnections';
import { displayedVariantOf } from './displayed-variant-of';
import { screenNameOf } from './screen-name-of';
import { useAutoFlood } from './useAutoFlood';
import { useDebugTick } from './useDebugTick';
import { useFloodRun } from './useFloodRun';
import { useNavMode } from './useNavMode';
import { useOverworldVariant } from './useOverworldVariant';
import { useRoomGeometry } from './useRoomGeometry';
import { useRoomStartLayer } from './useRoomStartLayer';
import type { RunHandler } from './hooks.type';

const useNavigation = () => {
  const { overworldScreenIndex, roomIndex, isIndoors, isDarkWorld, palaceIndex, whichEntrance, linkX: playerX, linkY: playerY } = useGameUIStore(s => s.map);
  const equipment = useGameUIStore(s => s.equipment);
  const inventoryItems = useGameUIStore(s => s.inventory.items);
  const overlayStore = useNavigationOverlayStore();
  const { result, connections, screenBundle, respawnEntIds, crossings, mode, setScreenBundle } = overlayStore;
  const runRef = useRef<RunHandler | null>(null);

  const debugTick = useDebugTick();
  const roomStartLayer = useRoomStartLayer(isIndoors, roomIndex, debugTick);
  const { dungeonMapPos, roomLayoutInfo } = useRoomGeometry(isIndoors, roomIndex, palaceIndex, debugTick);
  const variant = useOverworldVariant(isIndoors, overworldScreenIndex);
  const activeScreenIndex = isIndoors ? roomIndex : overworldScreenIndex;

  const detectedScreen = useScreenDetection(debugTick)?.screen ?? null;
  const screenId = detectedScreen?.id ?? null;
  const screenName = screenNameOf(detectedScreen, isIndoors, roomIndex, overworldScreenIndex);
  const displayedVariant = displayedVariantOf(isIndoors, result, variant);
  const renderResults = overlayStore.results;
  const reachableSum = renderResults.reduce((sum, r) => sum + r.reachableCount, 0);
  const totalTilesSum = renderResults.reduce((sum, r) => sum + r.totalTiles, 0);
  const entranceSum = crossings.reduce((sum, screen) => sum + listedCrossings(screen, isIndoors).length, 0);
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

  const { running, dynamicBlockerCount, handleRun } = useFloodRun({
    isIndoors, activeScreenIndex, overworldScreenIndex, screenName, screenId, equipment, inventoryItems, actions: overlayStore,
  });
  runRef.current = handleRun;

  const setMode = useNavMode({ mode, running, runRef, setOverlayMode: overlayStore.setMode });
  useAutoFlood({
    autoRun: mode === 'auto', running, isIndoors, playerX, playerY, activeScreenIndex, equipment, inventoryItems, runRef,
    setOverlayMode: overlayStore.setMode,
  });

  const handleClear = useCallback(() => { overlayStore.clear(); }, []);
  const { externalConnections, internalConnections, externalEdges } = useNavConnections(connections, screenBundle, isIndoors, crossings);

  return {
    screenBundle, screenName, screenId, isIndoors, roomIndex, isDarkWorld, overworldScreenIndex, externalConnections, externalEdges, crossings, renderResults, playerDebug, respawnEntIds, palaceIndex, dungeonMapPos, roomLayoutInfo, whichEntrance, roomStartLayer, progressInfo: wasmGetProgressIndicator(), gameStates: liveGameStates(), displayedVariant, dynamicBlockerCount, playerX, playerY, running, handleRun, result, handleClear, overlayStore, mode, setMode, reachableSum, totalTilesSum, entranceSum, internalConnections,
  };
};

export { useNavigation };
