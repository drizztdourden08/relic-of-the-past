/* @layer scripts @kind tooling */
import { formatGbaPointer } from './gba-room-pointer.mjs';

const dungeonRoomEntry = (roomId, source, parsed, snesComparison) => {
  const { address, fileOffset } = formatGbaPointer(source);
  return {
    roomId,
    pointer: address,
    fileOffset,
    sortMode: parsed.sortMode,
    snesComparison,
    records: parsed.records,
    rawHex: parsed.raw.toString('hex'),
  };
};

export { dungeonRoomEntry };
