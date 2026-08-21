/* @layer scripts @kind tooling */
const DUNGEON_ROOM_HEADER_SIZE = 14;

const parseDungeonRoomHeader = (rom, offset) => {
  if (offset < 0 || offset + DUNGEON_ROOM_HEADER_SIZE > rom.length) {
    throw new Error(`Dungeon room header offset is out of range: ${offset}`);
  }
  const raw = rom.subarray(offset, offset + DUNGEON_ROOM_HEADER_SIZE);
  const flags = raw[0];
  const stairQuadrants = [
    raw[7] & 3,
    (raw[7] >>> 2) & 3,
    (raw[7] >>> 4) & 3,
    (raw[7] >>> 6) & 3,
  ];

  return {
    bg2: flags >>> 5,
    collision: (flags >>> 2) & 7,
    lightsOut: Boolean(flags & 1),
    palette: raw[1],
    blockset: raw[2],
    enemyBlockset: raw[3],
    effect: raw[4],
    tags: [raw[5], raw[6]],
    destinations: {
      hole: { roomId: raw[9], quadrant: stairQuadrants[0] },
      stairs: [
        { roomId: raw[10], quadrant: stairQuadrants[1] },
        { roomId: raw[11], quadrant: stairQuadrants[2] },
        { roomId: raw[12], quadrant: stairQuadrants[3] },
        { roomId: raw[13], quadrant: raw[8] & 3 },
      ],
    },
    raw,
  };
};

export { DUNGEON_ROOM_HEADER_SIZE, parseDungeonRoomHeader };
