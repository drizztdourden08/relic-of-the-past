/* @layer renderer-widgets @kind logic */
import { screenForRoomIndex } from '@rotp/game-data';
import type { DetectedConnection } from '../../views/NavigationWidget/NavigationWidget.type';
import { hexLabel } from './hex-label';

const holeConnection = (room: number): DetectedConnection => {
  const screen = screenForRoomIndex(room);
  return {
    type: 'hole',
    targetRoomOrScreen: room,
    toScreenId: screen?.id ?? null,
    isExit: false,
    label: `Hole -> ${screen ? screen.name : hexLabel('room', room)}`,
  };
};

export { holeConnection };
