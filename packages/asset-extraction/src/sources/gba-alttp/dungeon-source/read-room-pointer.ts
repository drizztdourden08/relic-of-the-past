/* @layer shared-asset-extraction @kind logic */
import { gbaAddressToOffset } from '../../../rom/gba-rom';
import type { GbaRomReader } from '../../../rom/gba-rom';
import { ROOM_COUNT, ROOM_POINTER_BYTES } from './dungeon-source.constants';

const readRoomPointer = (rom: GbaRomReader, table: number, roomId: number): number => {
  if (roomId < 0 || roomId >= ROOM_COUNT) throw new Error(`Dungeon room ${roomId} is out of range`);
  const pointer = rom.romUint32(table + roomId * ROOM_POINTER_BYTES);
  gbaAddressToOffset(pointer);
  return pointer;
};

export { readRoomPointer };
