/* @layer shared-asset-extraction @kind logic */
import type { GbaRomReader } from '../../../rom/gba-rom';
import { FULL_HEADER_BYTES, MANDATORY_HEADER_BYTES, ROOM_POINTER_BYTES } from './header-record-length.constants';

const headerRecordLengths = (rom: GbaRomReader, table: number, roomCount: number): number[] => {
  const addresses = Array.from({ length: roomCount }, (_, roomId) => rom.romUint32(table + roomId * ROOM_POINTER_BYTES));
  const distinct = [...new Set(addresses)].sort((a, b) => a - b);
  const lengthByAddress = new Map<number, number>();
  distinct.forEach((address, index) => {
    const next = distinct[index + 1];
    const stored = next === undefined ? FULL_HEADER_BYTES : next - address;
    lengthByAddress.set(address, Math.min(Math.max(stored, MANDATORY_HEADER_BYTES), FULL_HEADER_BYTES));
  });
  return addresses.map(address => lengthByAddress.get(address) ?? FULL_HEADER_BYTES);
};

export { headerRecordLengths };
