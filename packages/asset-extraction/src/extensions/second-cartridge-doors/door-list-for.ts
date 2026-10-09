/* @layer shared-asset-extraction @kind logic */
import { DOOR_LIST_END } from './second-cartridge-doors.constants';
import { EXTRA_DUNGEON_DOORS } from './second-cartridge-doors.data';
import { staysInDungeon } from './stays-in-dungeon';

const doorListFor = (roomId: number): Buffer => {
  const kept = (EXTRA_DUNGEON_DOORS[roomId] ?? []).filter(word => staysInDungeon(roomId, word));
  const words = [...kept, DOOR_LIST_END];
  const result = Buffer.alloc(words.length * 2);
  words.forEach((word, index) => result.writeUInt16LE(word, index * 2));
  return result;
};

export { doorListFor };
