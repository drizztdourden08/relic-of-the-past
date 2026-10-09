/* @layer shared-asset-extraction @kind logic */
import type { DungeonRoomRecord } from '../dungeon/model';
import type { GbaRomReader } from '../rom/gba-rom';
import { extendedPaletteRecord } from '../extensions/second-cartridge-palettes';
import { extractDungeonPalette } from '../sources/gba-alttp';

const nonzeroCount = (record: Buffer): number => {
  let count = 0;
  for (let at = 0; at < record.length; at += 2) {
    if ((record.readUInt16LE(at) & 0x7fff) !== 0) count++;
  }
  return count;
};

const roomPaletteRecord = (rom: GbaRomReader, room: DungeonRoomRecord, rooms: readonly DungeonRoomRecord[]): Buffer => {
  const captured = extendedPaletteRecord(room.header.palette);
  if (captured) return captured;
  const own = extractDungeonPalette(rom, room.header.palette);
  if (nonzeroCount(own) >= own.length / 4) return own;
  for (const donor of rooms) {
    const record = extractDungeonPalette(rom, donor.header.palette);
    if (nonzeroCount(record) >= record.length / 4) return record;
  }
  return own;
};

export { roomPaletteRecord };
