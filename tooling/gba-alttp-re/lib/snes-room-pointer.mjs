/* @layer scripts @kind tooling */
import { snesAddressToOffset } from './common.mjs';

const readSnesRoomOffset = (snes, tableAddress, dataBank, roomId) => {
  const table = snesAddressToOffset(tableAddress);
  const pointer = snes.readUInt16LE(table + roomId * 2);
  return snesAddressToOffset(dataBank | pointer);
};

export { readSnesRoomOffset };
