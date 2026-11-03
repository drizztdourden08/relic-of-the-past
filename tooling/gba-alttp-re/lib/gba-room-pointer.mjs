/* @layer scripts @kind tooling */
import { hex } from './common.mjs';

const GBA_ROM_BASE = 0x08000000;
const GBA_ROM_END = 0x08800000;

const readGbaRoomPointer = (rom, tableOffset, roomId) => {
  const pointer = rom.readUInt32LE(tableOffset + roomId * 4);
  if (pointer < GBA_ROM_BASE || pointer >= GBA_ROM_END) {
    throw new Error(`Room 0x${roomId.toString(16)} has invalid pointer 0x${pointer.toString(16)}`);
  }
  return { pointer, offset: pointer - GBA_ROM_BASE };
};

const formatGbaPointer = ({ pointer, offset }) => ({
  address: hex(pointer),
  fileOffset: hex(offset),
});

export { formatGbaPointer, readGbaRoomPointer };
