/* @layer renderer-widgets @kind logic */
import type { DetectedConnection } from '../../views/NavigationWidget/NavigationWidget.type';
import { screenName } from '@app/game/record-text';
import { hexLabel } from './hex-label';
import { overworldScreen } from './overworld-screen';

const entranceConnection = (index: number, isExit: boolean): DetectedConnection => {
  const screen = overworldScreen(index);
  return {
    type: 'entrance',
    targetRoomOrScreen: index,
    toScreenId: screen?.id ?? null,
    isExit,
    label: screen ? screenName(screen) : hexLabel('OW', index),
  };
};

export { entranceConnection };
