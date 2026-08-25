/* @layer shared-asset-extraction @kind data */
/**
 * Door records for the extra dungeon's rooms.
 *
 * A door is not part of a room's tilemap the way a wall is — the engine reaches doors past a
 * marker in the room's object stream and reads them as two-byte records, and drawing one is
 * also what REGISTERS it: the tilemap address, the type and slot, the direction, and the
 * doorway's transit attribute all come from that pass. The cartridge ships its rooms
 * pre-expanded, so the records were baked away and every room came out sealed.
 *
 * They are recoverable, because a door draws a fixed shape at a fixed place. Every
 * (type, position, direction) the engine can draw was enumerated through its own door drawer,
 * then matched against each room's baked maps; a record is listed here when every cell it
 * writes is already present in the room exactly as the engine would have written it. The
 * results agree across room boundaries — each room's north door is answered by a south door in
 * the room above it — which is the check that this is recovery rather than pattern-matching.
 *
 * Word layout, the same one the engine decodes: type in the high byte, position in bits 4-7,
 * direction in bits 0-1 (0 north, 1 south, 2 west, 3 east).
 */

/** Terminator the engine's door reader stops on. */
const DOOR_LIST_END = 0xffff;

const EXTRA_DUNGEON_DOORS: Readonly<Record<number, readonly number[]>> = {
  0x69: [0x3660, 0x0001, 0x1861],
  // The east record is not from the pattern match: the match missed it, and walking the room on
  // original hardware showed an exit there onto 0x79. Its partner is room 0x79's own west door
  // at the same position, which the match did find, and both were observed at the same height.
  // The west record is a TELEPORT door, not a plain one: type 0x10's attribute becomes the
  // 0x89 transit family on a west/east door, and the engine then reads the destination from
  // the header's third staircase slot instead of walking to the grid neighbour. Measured on
  // hardware: the hub's west exit leads to the west chamber, whose own east door is the same
  // type reading the fourth slot for the way back.
  // No north record: the top-centre is the staircase to the east wing, and the door-shaped
  // frame around it pattern-matched as a door. Drawing one there registers it, and its transit
  // strip overwrites the staircase's slot attribute - measured through the engine.
  // The east record was 0x0023 (position 2), which the engine places mid-room - the centre
  // platform's frame art had pattern-matched as a door, and it drew AND registered there as
  // a working exit. The real east door is on the east wall at the lower position, mirroring
  // the east neighbour's own west record at the same height.
  0x78: [0x0071, 0x1022, 0x0083],
  0x79: [0x3660, 0x0001, 0x0022],
  0x88: [0x0010, 0x0a71],
  0x9a: [0x0020, 0x0071],
  0xad: [0x3680, 0x0021, 0x1881],
  0xbd: [0x3680, 0x0021, 0x0083],
  0xcd: [0x3680, 0x0021],
  0xdd: [0x1083],
  0xe9: [0x0022, 0x0083],
  0xec: [0x3660, 0x0001, 0x1861],
  0xfc: [0x3660, 0x0001, 0x0022],
};

/** Every room this dungeon owns; a plain door may only lead to one of them. */
const DUNGEON_ROOMS: ReadonlySet<number> = new Set([
  0x69, 0x78, 0x79, 0x88, 0x9a, 0xad, 0xbd, 0xcd, 0xdd, 0xe9, 0xec, 0xfc,
]);

/** Room-grid step per direction: north, south, west, east. The grid is 16 rooms wide. */
const STEP = [-16, 16, -1, 1] as const;

/**
 * Door types that leave for the overworld rather than a neighbouring room. Their destination
 * comes from the exit table, so the adjacency rule below does not apply to them.
 */
const LEAVES_DUNGEON: ReadonlySet<number> = new Set([6, 10, 12, 14, 16, 18]);

/**
 * Keep only the doors that stay inside this dungeon.
 *
 * A plain door has no destination of its own — the engine walks to the neighbouring room by
 * arithmetic on the room id. These twelve rooms are scattered across the grid, so several of
 * the recovered records point at whatever the base game has next door, and walking through one
 * drops the player into an unrelated part of the world. Those are dropped: some are shapes that
 * matched a door pattern without being one, and the rest are exits the cartridge reaches by
 * stairs and holes instead, which carry their destination in the room header.
 */
const staysInDungeon = (roomId: number, word: number): boolean => {
  const type = word >>> 8;
  if (LEAVES_DUNGEON.has(type)) return true;
  return DUNGEON_ROOMS.has(roomId + STEP[word & 3]);
};

/** One room's records as the bytes the engine reads, terminator included. */
const doorListFor = (roomId: number): Buffer => {
  const kept = (EXTRA_DUNGEON_DOORS[roomId] ?? []).filter(word => staysInDungeon(roomId, word));
  const words = [...kept, DOOR_LIST_END];
  const result = Buffer.alloc(words.length * 2);
  words.forEach((word, index) => result.writeUInt16LE(word, index * 2));
  return result;
};

export { DOOR_LIST_END, DUNGEON_ROOMS, EXTRA_DUNGEON_DOORS, doorListFor };
