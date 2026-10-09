/* @layer renderer-widgets @kind logic */
import type { ScreenRecord } from '@rotp/game-data';
import { screenForRoomIndex } from '@rotp/game-data';
import type { DetectedConnection, DetectionInput } from '../../views/NavigationWidget/NavigationWidget.type';
import { overworldScreen } from './overworld-screen';

const screenLabel = (screen: ScreenRecord): string => screen.name;

const detectConnections = (input: DetectionInput): DetectedConnection[] => {
  const { detectedEntranceScreens, detectedStairs, exitScreen, detectedFallHoleRooms } = input;
  const detected: DetectedConnection[] = [];

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

  for (const stair of detectedStairs) {
    if (stair.destRoom === 0) continue;
    const screen = screenForRoomIndex(stair.destRoom);
    detected.push({
      type: 'stair',
      targetRoomOrScreen: stair.destRoom,
      toScreenId: screen?.id ?? null,
      isExit: false,
      label: `${screen ? screenLabel(screen) : `Room 0x${stair.destRoom.toString(16).toUpperCase()}`} (${stair.direction})`,
    });
  }

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

  for (const room of detectedFallHoleRooms) {
    const screen = screenForRoomIndex(room);
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

export { detectConnections };
