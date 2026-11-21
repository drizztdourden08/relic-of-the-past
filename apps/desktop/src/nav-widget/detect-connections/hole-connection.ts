/* @layer renderer-widgets @kind logic */
import { screenForRoomIndex } from '@rotp/game-data';
import type { DetectedConnection } from '../../views/NavigationWidget/NavigationWidget.type';
import { screenName } from '@app/game/record-text';
import { hexLabel } from './hex-label';

const holeConnection = (room: number): DetectedConnection => {
  const screen = screenForRoomIndex(room);
  return {
    type: 'hole',
    targetRoomOrScreen: room,
    toScreenId: screen?.id ?? null,
    isExit: false,
    label: `Hole -> ${screen ? screenName(screen) : hexLabel('room', room)}`,
  };
};

export { holeConnection };
