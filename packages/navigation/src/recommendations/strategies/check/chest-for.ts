/* @layer shared-game @kind logic */
import type { CheckRecord } from '@rotp/game-data';
import type { ChestObservation } from '@rotp/game-core';
import type { ScreenObservations } from '../../detection-types/detection.type';
import { roomIdOf } from './room-id-of';

const chestFor = (observations: ScreenObservations, record: CheckRecord): ChestObservation | undefined => {
  const { chests } = observations;
  const roomId = roomIdOf(observations);
  if (!chests || roomId == null || record.gameId.roomId !== roomId) return undefined;
  return chests.find(chest => chest.chestIndex === record.gameId.chestIndex);
};

export { chestFor };
