/* @layer renderer-widgets @kind hook */
import { useMemo } from 'react';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useNavigationOverlayStore } from '@app/stores/navigation-overlay-store';
import {
  wasmGetEntranceRooms, wasmGetExitScreenMap, wasmGetRoomStairInfo,
  wasmGetRoomTagsFor, wasmGetDungeonMapPosition, wasmGetEntranceSpawns,
  wasmGetRoomWalkBoundaries, wasmGetRoomDoorBoundaryTiles,
} from '@app/lib/game';
import { getPalaceMismatches } from '@shared/game/logic/queries/palace-fallback';
import type { ScreenGameId } from '@shared/game/data';
import type { LiveDoorBoundaryTile, LiveDungeonMapPosition, LiveWalkBoundary } from '@shared/game/recommendations';
import { useScreenDetection } from '../../hooks';
import { useRealTransitions } from '../../useRealTransitions';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import type { ScreenLiveObservations } from '../LiveDataInspector.type';

const useScreenObservations = (): ScreenLiveObservations => {
  const { overworldScreenIndex, roomIndex, isIndoors, isDarkWorld, palaceIndex, whichEntrance } = useGameUIStore(s => s.map);
  const match = useScreenDetection();
  const floodConnections = useNavigationOverlayStore(s => s.connections);

  const detectedEntranceScreens = useMemo(() => {
    if (!isIndoors) return [];
    const rooms = wasmGetEntranceRooms();
    const exitScreen = wasmGetExitScreenMap().get(roomIndex);
    if (!rooms || exitScreen == null) return [];
    return [exitScreen];
  }, [isIndoors, roomIndex]);

  const detectedStairs = useMemo(() => (isIndoors ? wasmGetRoomStairInfo() : []), [isIndoors, roomIndex]);

  const entranceRooms = useMemo<readonly number[] | undefined>(() => {
    const rooms = wasmGetEntranceRooms();
    return rooms ? Array.from(rooms) : undefined;
  }, [roomIndex]);

  const exitScreen = useMemo(() => (isIndoors ? wasmGetExitScreenMap().get(roomIndex) ?? null : null), [isIndoors, roomIndex]);

  const realTransitions = useRealTransitions(isIndoors, roomIndex, floodConnections, overworldScreenIndex);

  const detectedFallHoleRooms = useMemo(
    () => realTransitions.filter(t => t.source === 'hole').map(t => t.index),
    [realTransitions],
  );

  const screenId = match?.screen.id ?? null;
  const connStatus = useConnectionStatus(screenId, detectedEntranceScreens, detectedStairs, exitScreen, detectedFallHoleRooms);
  const realAvailable = isIndoors ? screenId != null : floodConnections.length > 0;

  const liveGameId = useMemo<ScreenGameId>(
    () => ({ overworldIndex: overworldScreenIndex, roomIndex, palaceIndex, entranceId: whichEntrance }),
    [overworldScreenIndex, roomIndex, palaceIndex, whichEntrance],
  );

  const palaceMismatches = useMemo(() => [...getPalaceMismatches().values()], [match]);

  const roomTags = useMemo<readonly number[] | undefined>(
    () => (isIndoors ? wasmGetRoomTagsFor(roomIndex) : undefined),
    [isIndoors, roomIndex],
  );

  const dungeonMapPos = useMemo<LiveDungeonMapPosition | undefined>(
    () => (isIndoors ? wasmGetDungeonMapPosition() ?? undefined : undefined),
    [isIndoors, roomIndex],
  );

  const entranceSpawns = useMemo<readonly { x: number; y: number }[] | undefined>(
    () => wasmGetEntranceSpawns() ?? undefined,
    [roomIndex],
  );

  const walkBoundaries = useMemo<readonly LiveWalkBoundary[] | undefined>(
    () => (isIndoors ? wasmGetRoomWalkBoundaries() : undefined),
    [isIndoors, roomIndex],
  );
  const doorBoundaries = useMemo<readonly LiveDoorBoundaryTile[] | undefined>(
    () => (isIndoors ? wasmGetRoomDoorBoundaryTiles() : undefined),
    [isIndoors, roomIndex],
  );

  return {
    screenId, isIndoors, isDarkWorld, match, liveGameId, realTransitions, realAvailable,
    unmatchedCrossings: connStatus.unmatched, floodConnections,
    existingConnections: connStatus.existingConnections, palaceMismatches, entranceRooms,
    roomTags, dungeonMapPos, entranceSpawns, walkBoundaries, doorBoundaries,
  };
};

export { useScreenObservations };
