/* @layer shared-asset-extraction @kind logic */
import { FIRST_TRAVEL_BYTE, LAST_TRAVEL_BYTE, UNUSED_DESTINATION } from './compile-resources-gba-alttp.constants';

const assertTravelStaysInDungeon = (bytes: Buffer, roomId: number, rooms: ReadonlySet<number>): void => {
  const stray: string[] = [];
  for (let at = FIRST_TRAVEL_BYTE; at <= LAST_TRAVEL_BYTE; at++) {
    const destination = bytes.readUInt8(at);
    if (destination !== UNUSED_DESTINATION && !rooms.has(destination)) {
      stray.push(`byte ${at} -> 0x${destination.toString(16)}`);
    }
  }
  if (stray.length > 0) {
    throw new Error(`Room 0x${roomId.toString(16)} travels outside the dungeon: ${stray.join(', ')}`);
  }
};

export { assertTravelStaysInDungeon };
