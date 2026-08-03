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
import { wasmGetEntranceRooms, wasmGetExitScreenMap, wasmGetRoomStairInfo, wasmGetFallHoles, wasmGetAreaHeads } from '@app/lib/game';
import { getPalaceMismatches } from '@shared/game/logic/queries/palace-fallback';
import type { PalaceMismatch } from '@shared/game/logic/queries/palace-fallback';
import type { ConnectionRecord, ScreenGameId, ScreenId } from '@shared/game/data';
import type { ScreenMatchResult } from '@shared/game/logic/queries/detection';
import type { ConnectionInfo } from '@shared/game/navigation';
import type { ObservedCrossing, ObservedTransition } from '@shared/game/recommendations';
import { useScreenDetection } from '../../hooks';
import { useRealTransitions } from '../../useRealTransitions';
import { useConnectionStatus } from '../../useDatasetStatus';

interface ScreenLiveObservations {
  screenId: ScreenId | null;
  isIndoors: boolean;
  match: ScreenMatchResult | null;
  liveGameId: ScreenGameId;
  realTransitions: readonly ObservedTransition[];
  realAvailable: boolean;
  unmatchedCrossings: readonly ObservedCrossing[];
  floodConnections: readonly ConnectionInfo[];
  existingConnections: readonly ConnectionRecord[];
  palaceMismatches: readonly PalaceMismatch[];
}

const useScreenObservations = (): ScreenLiveObservations => {
  const { overworldScreenIndex, roomIndex, isIndoors, palaceIndex, whichEntrance } = useGameUIStore(s => s.map);
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

  const exitScreen = useMemo(() => (isIndoors ? wasmGetExitScreenMap().get(roomIndex) ?? null : null), [isIndoors, roomIndex]);

  // Fall holes on the current overworld area, resolved entrance-id → room via
  // the same head-group comparison useRealTransitions' collectFallHoles uses.
  const detectedFallHoleRooms = useMemo(() => {
    if (isIndoors) return [];
    const heads = wasmGetAreaHeads();
    const entranceRooms = wasmGetEntranceRooms();
    const currentHead = heads ? heads[overworldScreenIndex] : overworldScreenIndex;
    const rooms: number[] = [];
    for (const hole of wasmGetFallHoles()) {
      const holeHead = heads ? heads[hole.area] : hole.area;
      if (holeHead !== currentHead) continue;
      const room = entranceRooms?.[hole.entranceId];
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

  return {
    screenId, isIndoors, match, liveGameId, realTransitions, realAvailable,
    unmatchedCrossings: connStatus.unmatched, floodConnections,
    existingConnections: connStatus.existingConnections, palaceMismatches,
  };
};

export { useScreenObservations };
export type { ScreenLiveObservations };
