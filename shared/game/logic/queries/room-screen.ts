/* @layer shared-game @kind logic */
import { getScreenByGameId } from '../../data';
import type { ScreenRecord } from '../../data';
import { getScreenLookup } from './detection';

const screenForRoomIndex = (roomIndex: number): ScreenRecord | undefined => {
  const lookup = getScreenLookup();
  return getScreenByGameId({ roomIndex })
    ?? lookup.byCaveRoom.get(roomIndex)
    ?? lookup.byRoomAny.get(roomIndex);
};

export { screenForRoomIndex };
