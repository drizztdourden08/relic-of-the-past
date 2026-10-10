/* @layer shared-asset-extraction @kind logic */
import type { DungeonRoomHeader } from '../../../dungeon/model';
import type { GbaRomReader } from '../../../rom/gba-rom';
import { FULL_HEADER_BYTES } from '../header-record-length';

const parseRoomHeader = (rom: GbaRomReader, address: number, storedBytes: number): DungeonRoomHeader => {
  const raw = Buffer.alloc(FULL_HEADER_BYTES);
  rom.romSlice(address, storedBytes).copy(raw);
  const byte = (index: number): number => raw.readUInt8(index);
  const flags = byte(0);
  const quadrantBits = byte(7);
  return {
    bg2: flags >>> 5,
    collision: (flags >>> 2) & 7,
    lightsOut: Boolean(flags & 1),
    palette: byte(1),
    blockset: byte(2),
    enemyBlockset: byte(3),
    effect: byte(4),
    tags: [byte(5), byte(6)],
    hole: { roomId: byte(9), quadrant: quadrantBits & 3 },
    stairs: [
      { roomId: byte(10), quadrant: (quadrantBits >>> 2) & 3 },
      { roomId: byte(11), quadrant: (quadrantBits >>> 4) & 3 },
      { roomId: byte(12), quadrant: quadrantBits >>> 6 },
      { roomId: byte(13), quadrant: byte(8) & 3 },
    ],
    nativeBytes: Buffer.from(raw),
  };
};

export { parseRoomHeader };
