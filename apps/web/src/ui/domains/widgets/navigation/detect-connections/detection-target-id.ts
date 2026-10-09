/* @layer renderer-widgets @kind logic */
import type { ScreenId } from '@shared/game/data';
import { screenForRoomIndex } from '@shared/game/logic/queries/room-screen';
import type { DetectedConnection } from '../navigation.type';
import { overworldScreen } from './overworld-screen';

const detectionTargetId = (det: DetectedConnection): ScreenId | undefined =>
  det.toScreenId
  ?? overworldScreen(det.targetRoomOrScreen)?.id
  ?? screenForRoomIndex(det.targetRoomOrScreen)?.id;

export { detectionTargetId };
