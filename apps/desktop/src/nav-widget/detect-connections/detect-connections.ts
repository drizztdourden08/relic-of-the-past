/* @layer renderer-widgets @kind logic */
import type { DetectedConnection, DetectionInput } from '../../views/NavigationWidget/NavigationWidget.type';
import { entranceConnection } from './entrance-connection';
import { holeConnection } from './hole-connection';
import { stairConnection } from './stair-connection';

const detectConnections = (input: DetectionInput): DetectedConnection[] => {
  const { detectedEntranceScreens, detectedStairs, exitScreen, detectedFallHoleRooms } = input;
  const exits = exitScreen == null ? [] : [entranceConnection(exitScreen, true)];

  return [
    ...detectedEntranceScreens.map((index) => entranceConnection(index, false)),
    ...detectedStairs.filter((stair) => stair.destRoom !== 0).map(stairConnection),
    ...exits,
    ...detectedFallHoleRooms.map(holeConnection),
  ];
};

export { detectConnections };
