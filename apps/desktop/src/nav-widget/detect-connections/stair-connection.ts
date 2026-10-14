/* @layer renderer-widgets @kind logic */
import { screenForRoomIndex } from '@rotp/game-data';
import type { DetectedConnection, DetectionInput } from '../../views/NavigationWidget/NavigationWidget.type';
import { hexLabel } from './hex-label';

const stairConnection = (stair: DetectionInput['detectedStairs'][number]): DetectedConnection => {
  const screen = screenForRoomIndex(stair.destRoom);
  return {
    type: 'stair',
    targetRoomOrScreen: stair.destRoom,
    toScreenId: screen?.id ?? null,
    isExit: false,
    label: `${screen ? screen.name : hexLabel('Room', stair.destRoom)} (${stair.direction})`,
  };
};

export { stairConnection };
