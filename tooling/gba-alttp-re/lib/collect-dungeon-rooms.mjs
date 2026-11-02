/* @layer scripts @kind tooling */
import { dungeonRoomEntry } from './dungeon-room-entry.mjs';
import { readGbaRoomPointer } from './gba-room-pointer.mjs';
import { readSnesRoomOffset } from './snes-room-pointer.mjs';

const collectDungeonRooms = ({ gba, snes, gbaTableOffset, roomCount, snesRoomCount, snesTable, snesBank, parseList }) => {
  const rooms = [];
  let exactSnesMatches = 0;
  const modifiedSnesRooms = [];
  for (let roomId = 0; roomId < roomCount; roomId++) {
    const source = readGbaRoomPointer(gba, gbaTableOffset, roomId);
    const parsed = parseList(gba, source.offset, roomId);
    let snesComparison = 'extension';
    if (roomId < snesRoomCount) {
      const snesList = parseList(snes, readSnesRoomOffset(snes, snesTable, snesBank, roomId), roomId);
      snesComparison = parsed.raw.equals(snesList.raw) ? 'exact' : 'modified';
      if (snesComparison === 'exact') exactSnesMatches++;
      else modifiedSnesRooms.push(roomId);
    }
    rooms.push(dungeonRoomEntry(roomId, source, parsed, snesComparison));
  }
  return { rooms, exactSnesMatches, modifiedSnesRooms };
};

export { collectDungeonRooms };
