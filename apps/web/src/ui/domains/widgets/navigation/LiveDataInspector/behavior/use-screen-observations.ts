/* @layer renderer-widgets @kind hook */
/**
 * The screen/connection half of a live `ScreenObservations` — everything the
 * old Dataset widget read to drive its status badges and connection audit,
 * assembled here instead so a detection pass can read the identical ground
 * truth. `liveSprites`/`spriteCombat`/`grantedItems` are NOT this hook's job;
 * see `use-sprite-observations.ts` and `use-granted-items.ts`.
 */
import { useMemo } from 'react';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useNavigationOverlayStore } from '@app/stores/navigation-overlay-store';
import {
  wasmGetEntranceRooms, wasmGetExitScreenMap, wasmGetRoomStairInfo, wasmGetFallHoles, wasmGetAreaHeads,
  wasmGetRoomTagsFor, wasmGetDungeonMapPosition, wasmGetEntranceSpawns,
  wasmGetRoomWalkBoundaries, wasmGetRoomDoorBoundaryTiles,
} from '@app/lib/game';
import { getPalaceMismatches } from '@shared/game/logic/queries/palace-fallback';
import type { PalaceMismatch } from '@shared/game/logic/queries/palace-fallback';
import type { ConnectionRecord, ScreenGameId, ScreenId } from '@shared/game/data';
import type { ScreenMatchResult } from '@shared/game/logic/queries/detection';
import type { ConnectionInfo } from '@shared/game/navigation';
import type {
  LiveDoorBoundaryTile, LiveDungeonMapPosition, LiveWalkBoundary, ObservedCrossing, ObservedTransition,
} from '@shared/game/recommendations';
import { useScreenDetection } from '../../hooks';
import { useRealTransitions } from '../../useRealTransitions';
import { useConnectionStatus } from '../../useDatasetStatus';

interface ScreenLiveObservations {
  screenId: ScreenId | null;
  isIndoors: boolean;
  isDarkWorld: boolean;
  match: ScreenMatchResult | null;
  liveGameId: ScreenGameId;
  realTransitions: readonly ObservedTransition[];
  realAvailable: boolean;
  unmatchedCrossings: readonly ObservedCrossing[];
  floodConnections: readonly ConnectionInfo[];
  existingConnections: readonly ConnectionRecord[];
  palaceMismatches: readonly PalaceMismatch[];
  entranceRooms?: readonly number[];
  roomTags?: readonly number[];
  dungeonMapPos?: LiveDungeonMapPosition;
  entranceSpawns?: readonly { x: number; y: number }[];
  walkBoundaries?: readonly LiveWalkBoundary[];
  doorBoundaries?: readonly LiveDoorBoundaryTile[];
}

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

  // Static native table (entrance id -> room index). Read once module-side
  // per room change; absent (module not loaded yet) means "not read".
  const entranceRooms = useMemo<readonly number[] | undefined>(() => {
    const rooms = wasmGetEntranceRooms();
    return rooms ? Array.from(rooms) : undefined;
  }, [roomIndex]);

  const exitScreen = useMemo(() => (isIndoors ? wasmGetExitScreenMap().get(roomIndex) ?? null : null), [isIndoors, roomIndex]);

  // Fall holes on the current overworld area, resolved entrance-id → room via
  // the same head-group comparison useRealTransitions' collectFallHoles uses.
  const detectedFallHoleRooms = useMemo(() => {
    if (isIndoors) return [];
    const heads = wasmGetAreaHeads();
    const entranceRoomTable = wasmGetEntranceRooms();
    const currentHead = heads ? heads[overworldScreenIndex] : overworldScreenIndex;
    const rooms: number[] = [];
    for (const hole of wasmGetFallHoles()) {
      const holeHead = heads ? heads[hole.area] : hole.area;
      if (holeHead !== currentHead) continue;
      const room = entranceRoomTable?.[hole.entranceId];
      if (room != null && room !== 0) rooms.push(room);
    }
    return rooms;
  }, [isIndoors, overworldScreenIndex]);

  const screenId = match?.screen.id ?? null;
  const connStatus = useConnectionStatus(screenId, detectedEntranceScreens, detectedStairs, exitScreen, detectedFallHoleRooms);
  const realTransitions = useRealTransitions(isIndoors, roomIndex, floodConnections, overworldScreenIndex);
  const realAvailable = isIndoors ? screenId != null : floodConnections.length > 0;

  const liveGameId = useMemo<ScreenGameId>(
    () => ({ overworldIndex: overworldScreenIndex, roomIndex, palaceIndex, entranceId: whichEntrance }),
    [overworldScreenIndex, roomIndex, palaceIndex, whichEntrance],
  );

  const palaceMismatches = useMemo(() => [...getPalaceMismatches().values()], [match]);

  // Room-header tag bytes — meaningless outdoors (no room header to read),
  // so this stays absent there rather than reading as "no tags".
  const roomTags = useMemo<readonly number[] | undefined>(
    () => (isIndoors ? wasmGetRoomTagsFor(roomIndex) : undefined),
    [isIndoors, roomIndex],
  );

  // Dungeon-map position — same "meaningless outdoors" reasoning as `roomTags`;
  // the native call itself also answers `found: false` for a house/cave, which
  // is a resolved negative once read, not a reason to withhold the whole field.
  const dungeonMapPos = useMemo<LiveDungeonMapPosition | undefined>(
    () => (isIndoors ? wasmGetDungeonMapPosition() ?? undefined : undefined),
    [isIndoors, roomIndex],
  );

  // Entrance id -> spawn tile table. Static and entrance-indexed rather than
  // room-indexed, like `entranceRooms` above, so it is read the same way —
  // unconditionally, gated only by whether the module has anything to report.
  const entranceSpawns = useMemo<readonly { x: number; y: number }[] | undefined>(
    () => wasmGetEntranceSpawns() ?? undefined,
    [roomIndex],
  );

  // The room's own exit tables — enumerable, so an indoor scroll edge can
  // finally be judged for removal against them (F3); meaningless outdoors,
  // same "not read" reasoning as `roomTags`/`dungeonMapPos` above.
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
export type { ScreenLiveObservations };
