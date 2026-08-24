/* @layer shared-asset-extraction @kind logic */
/**
 * How long each room's header record actually is.
 *
 * The cartridge stores the fourteen-byte room header with its trailing zero bytes trimmed, and
 * the pointer table is what records where one record ends and the next begins. The first seven
 * bytes are always present; everything after them — the quadrant nibbles, the hole destination
 * and the four staircase destinations — is only stored up to the last non-zero byte, so records
 * come out at seven, ten, eleven, twelve, thirteen or fourteen bytes.
 *
 * Reading a fixed fourteen bytes therefore walks off the end of every short record and picks up
 * the next room's header as this room's travel destinations. That is not a subtle corruption:
 * it silently rewrites where a staircase leads. Lengths are recovered by sorting the pointer
 * table and measuring the gap to whichever record is stored next.
 */
import type { GbaRomReader } from '../../rom/gba-rom';

/** The header as the engine consumes it, once the trimmed bytes are restored as zero. */
const FULL_HEADER_BYTES = 14;

/** Bytes every record stores, before trailing-zero trimming can apply. */
const MANDATORY_HEADER_BYTES = 7;

/**
 * Measure every room's stored record length from the pointer table.
 *
 * Rooms may share one record — the table holds duplicate pointers — so the gap is taken to the
 * next *distinct* address rather than to the next entry.
 */
const headerRecordLengths = (rom: GbaRomReader, table: number, roomCount: number): number[] => {
  const addresses = Array.from({ length: roomCount }, (_, roomId) => rom.romUint32(table + roomId * 4));
  const distinct = [...new Set(addresses)].sort((a, b) => a - b);
  const lengthByAddress = new Map<number, number>();
  distinct.forEach((address, index) => {
    const next = distinct[index + 1];
    const stored = next === undefined ? FULL_HEADER_BYTES : next - address;
    lengthByAddress.set(address, Math.min(Math.max(stored, MANDATORY_HEADER_BYTES), FULL_HEADER_BYTES));
  });
  return addresses.map(address => lengthByAddress.get(address) ?? FULL_HEADER_BYTES);
};

export { FULL_HEADER_BYTES, MANDATORY_HEADER_BYTES, headerRecordLengths };
