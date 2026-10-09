/* @layer renderer-widgets @kind logic */
import type { ScreenId } from '@rotp/game-data';
import { screenForRoomIndex } from '@rotp/game-data';
import type { DetectedConnection } from '../../views/NavigationWidget/NavigationWidget.type';
import { overworldScreen } from './overworld-screen';

const detectionTargetId = (det: DetectedConnection): ScreenId | undefined =>
  det.toScreenId
  ?? overworldScreen(det.targetRoomOrScreen)?.id
  ?? screenForRoomIndex(det.targetRoomOrScreen)?.id;

export { detectionTargetId };
