/* @layer shared-asset-extraction @kind logic */
import type { DungeonRoomHeader } from '../../../dungeon/model';
import type { GbaRomReader } from '../../../rom/gba-rom';
import { FULL_HEADER_BYTES } from '../header-record-length';

const parseRoomHeader = (rom: GbaRomReader, address: number, storedBytes: number): DungeonRoomHeader => {
  const raw = Buffer.alloc(FULL_HEADER_BYTES);
  rom.romSlice(address, storedBytes).copy(raw);
  const flags = raw[0];
  const quadrants = [raw[7] & 3, (raw[7] >>> 2) & 3, (raw[7] >>> 4) & 3, raw[7] >>> 6, raw[8] & 3];
  return {
    bg2: flags >>> 5,
    collision: (flags >>> 2) & 7,
    lightsOut: Boolean(flags & 1),
    palette: raw[1],
    blockset: raw[2],
    enemyBlockset: raw[3],
    effect: raw[4],
    tags: [raw[5], raw[6]],
    hole: { roomId: raw[9], quadrant: quadrants[0] },
    stairs: [
      { roomId: raw[10], quadrant: quadrants[1] },
      { roomId: raw[11], quadrant: quadrants[2] },
      { roomId: raw[12], quadrant: quadrants[3] },
      { roomId: raw[13], quadrant: quadrants[4] },
    ],
    nativeBytes: Buffer.from(raw),
  };
};

export { parseRoomHeader };
