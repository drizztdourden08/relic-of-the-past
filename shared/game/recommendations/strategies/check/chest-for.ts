/* @layer shared-game @kind logic */
import type { CheckRecord } from '../../../data';
import type { ChestObservation, ScreenObservations } from '../../detection-types';
import { roomIdOf } from './room-id-of';

const chestFor = (observations: ScreenObservations, record: CheckRecord): ChestObservation | undefined => {
  const { chests } = observations;
  const roomId = roomIdOf(observations);
  if (!chests || roomId == null || record.gameId.roomId !== roomId) return undefined;
  return chests.find(chest => chest.chestIndex === record.gameId.chestIndex);
};

export { chestFor };
