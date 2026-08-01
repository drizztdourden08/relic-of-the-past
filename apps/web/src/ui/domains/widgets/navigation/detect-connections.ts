/* @layer renderer-widgets @kind logic */
/**
 * Turns the game's live exit data into `DetectedConnection`s.
 *
 * Every detection carries the screen ID it resolves to, so no consumer has to
 * recover identity from the label — the "Exit → " prefix that a later step used
 * to strip is now the `isExit` flag instead.
 */
import { findOne, getScreenByGameId } from '@shared/game/data';
import type { ScreenId, ScreenRecord } from '@shared/game/data';
import { getScreenLookup } from '@shared/game/logic/queries/detection';
import type { RoomStairInfo } from '../../../../lib/game';

interface DetectedConnection {
  type: 'entrance' | 'stair' | 'edge' | 'hole';
  /** The raw game index the detector reported. */
  targetRoomOrScreen: number;
  /** The dataset screen it resolves to, or null when no record covers it. */
  toScreenId: ScreenId | null;
  /** True for the exit-screen detector, which reuses the `entrance` type. */
  isExit: boolean;
  /** Display text only. Identity lives in `toScreenId`; nothing parses this. */
  label: string;
}

interface DetectionInput {
  detectedEntranceScreens: number[];
  detectedStairs: RoomStairInfo[];
  exitScreen: number | null;
  detectedFallHoleRooms: number[];
}

const screenLabel = (screen: ScreenRecord): string => screen.vanillaName ?? screen.randomizerName;

/** An indoor room index, resolved through the facade's reverse index first. */
const roomScreen = (roomIndex: number): ScreenRecord | undefined =>
  getScreenByGameId({ roomIndex })
  ?? getScreenLookup().byCaveRoom.get(roomIndex)
  ?? findOne('screen', s => s.kind === 'dungeon' && s.gameId.roomIndex === roomIndex);

const overworldScreen = (index: number): ScreenRecord | undefined =>
  getScreenLookup().byOverworldScreen.get(index);

const detectConnections = (input: DetectionInput): DetectedConnection[] => {
  const { detectedEntranceScreens, detectedStairs, exitScreen, detectedFallHoleRooms } = input;
  const detected: DetectedConnection[] = [];

  // Entrances: each entrance that leads to this room from an overworld screen.
  for (const index of detectedEntranceScreens) {
    const screen = overworldScreen(index);
    detected.push({
      type: 'entrance',
      targetRoomOrScreen: index,
      toScreenId: screen?.id ?? null,
      isExit: false,
      label: screen ? screenLabel(screen) : `OW 0x${index.toString(16).toUpperCase()}`,
    });
  }

  // Stairs: each stair destination room.
  for (const stair of detectedStairs) {
    if (stair.destRoom === 0) continue;
    const screen = roomScreen(stair.destRoom);
    detected.push({
      type: 'stair',
      targetRoomOrScreen: stair.destRoom,
      toScreenId: screen?.id ?? null,
      isExit: false,
      label: `${screen ? screenLabel(screen) : `Room 0x${stair.destRoom.toString(16).toUpperCase()}`} (${stair.direction})`,
    });
  }

  // The overworld screen this room exits back onto.
  if (exitScreen != null) {
    const screen = overworldScreen(exitScreen);
    detected.push({
      type: 'entrance',
      targetRoomOrScreen: exitScreen,
      toScreenId: screen?.id ?? null,
      isExit: true,
      label: screen ? screenLabel(screen) : `OW 0x${exitScreen.toString(16).toUpperCase()}`,
    });
  }

  // Fall holes: each hole on this overworld screen drops into a room.
  for (const room of detectedFallHoleRooms) {
    const screen = roomScreen(room);
    detected.push({
      type: 'hole',
      targetRoomOrScreen: room,
      toScreenId: screen?.id ?? null,
      isExit: false,
      label: `Hole → ${screen ? screenLabel(screen) : `room 0x${room.toString(16).toUpperCase()}`}`,
    });
  }

  return detected;
};

/** The screen a detection points at, whichever index space it came from. */
const detectionTargetId = (det: DetectedConnection): ScreenId | undefined =>
  det.toScreenId
  ?? overworldScreen(det.targetRoomOrScreen)?.id
  ?? roomScreen(det.targetRoomOrScreen)?.id;

export { detectConnections, detectionTargetId, roomScreen, screenLabel };
export type { DetectedConnection, DetectionInput };
