/* @layer shared-game @kind logic */
/**
 * The one room-index → screen resolution, for callers that hold a bare room
 * number and no palace context.
 *
 * A room number alone is ambiguous — a palace room and an unrelated cave can
 * share one — so the order matters: the palace-less record first (the exact
 * meaning of "a room with no palace"), then the cave index, and only then any
 * record holding that room at all. Every step is an indexed lookup off the
 * cached screen lookup; nothing here scans the record list.
 */
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
