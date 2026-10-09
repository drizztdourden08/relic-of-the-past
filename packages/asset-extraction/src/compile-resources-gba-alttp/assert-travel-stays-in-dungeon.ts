/* @layer shared-asset-extraction @kind logic */
import { FIRST_TRAVEL_BYTE, LAST_TRAVEL_BYTE, UNUSED_DESTINATION } from './compile-resources-gba-alttp.constants';

const assertTravelStaysInDungeon = (bytes: Buffer, roomId: number, rooms: ReadonlySet<number>): void => {
  const stray: string[] = [];
  for (let at = FIRST_TRAVEL_BYTE; at <= LAST_TRAVEL_BYTE; at++) {
    if (bytes[at] !== UNUSED_DESTINATION && !rooms.has(bytes[at])) {
      stray.push(`byte ${at} -> 0x${bytes[at].toString(16)}`);
    }
  }
  if (stray.length > 0) {
    throw new Error(`Room 0x${roomId.toString(16)} travels outside the dungeon: ${stray.join(', ')}`);
  }
};

export { assertTravelStaysInDungeon };
