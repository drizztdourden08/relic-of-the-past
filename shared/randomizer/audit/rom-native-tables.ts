/* @layer shared-game @kind logic */
/**
 * The cartridge's own id tables, read straight out of a ROM image.
 *
 * Every number a record carries under `gameId` comes from one of these, so a test can
 * hold the dataset against the bytes instead of against a transcription. Addresses are
 * SNES LoROM and go through `snesToLinear`; each one is cited where it is read.
 */
import { snesToLinear } from '../../asset-extraction/rom/snes-address';

/** One of the 129 overworld entrance slots, or one of the 19 fall-hole slots. */
interface RomMouth {
  table: 'entrance' | 'hole';
  slot: number;
  /** The value the game puts in `which_entrance` ($010E). */
  entranceId: number;
  /** The area word the slot is filed under: a large area's head, never its sub-screen. */
  area: number;
  /** The sub-screen the mouth actually sits on, derived from `area` plus the tile. */
  screen: number;
  /** The mouth's tile inside the area, in 16px collision tiles. */
  x: number;
  y: number;
}

/** One of the 79 exit slots: leaving a room puts the player back on the overworld. */
interface RomExit {
  index: number;
  room: number;
  /** The area the exit lands in, again a head for a large area. */
  screenIndex: number;
  /** The landing spot in pixels, relative to the area's own origin. */
  x: number;
  y: number;
}

/** A room header's four inter-room staircase destinations, plus its fall-hole destination. */
interface RomRoomTravel {
  holeDest: number;
  stairDest: readonly number[];
  tags: readonly number[];
}

interface RomNativeTables {
  /** $82A5EC, 64 bytes: the head area of every overworld area. */
  areaHeads: readonly number[];
  /** $82C813, 133 words: the room each entrance id lands in. */
  entranceRooms: readonly number[];
  /** $82D48B, 133 signed bytes: `cur_palace_index_x2`, or -1 outside a dungeon. */
  entrancePalaces: readonly number[];
  mouths: readonly RomMouth[];
  exits: readonly RomExit[];
  /** True for an area that is its own head, and for the two special screens. */
  isAreaHead: (area: number) => boolean;
  /** The head of an area, carrying the world bit. */
  headOf: (area: number) => number;
  roomTravel: (room: number) => RomRoomTravel;
  /**
   * Every room the in-game dungeon map draws, to the `cur_palace_index_x2` it is drawn under.
   * A dungeon room the map leaves out is absent, so a miss means "off the map", never "not a
   * dungeon room"; a hit is the cartridge naming the dungeon a room belongs to.
   */
  palaceOfRoom: ReadonlyMap<number, number>;
}

const COPIER_HEADER_SIZE = 512;
const ENTRANCE_COUNT = 133;
const OW_ENTRANCE_SLOTS = 129;
const HOLE_SLOTS = 19;
const EXIT_SLOTS = 79;
const AREA_COUNT = 64;
/** The dungeon map's own bank, and how many 5x5 cells each palace fills (25 a floor). */
const DUNGEON_MAP_BANK = 0xa0000;
const DUNGEON_MAP_SIZES = [75, 125, 50, 75, 175, 75, 50, 75, 50, 200, 150, 75, 100, 200];
const DUNGEON_MAP_EMPTY = 0xf;
const SPECIAL_SCREEN_FIRST = 0x80;

/** Strip a 512-byte copier header when one is present (size is 512 mod 1024). */
const stripCopierHeader = (bytes: Uint8Array): Uint8Array =>
  bytes.length % 1024 === COPIER_HEADER_SIZE ? bytes.subarray(COPIER_HEADER_SIZE) : bytes;

const readRomNativeTables = (romBytes: Uint8Array): RomNativeTables => {
  const bytes = stripCopierHeader(romBytes);
  const byteAt = (ea: number): number => bytes[snesToLinear(ea)];
  const wordAt = (ea: number): number => byteAt(ea) | (byteAt(ea + 1) << 8);
  const signedAt = (ea: number): number => {
    const value = byteAt(ea);
    return value & 0x80 ? value - 0x100 : value;
  };

  // overworld.c:157 keeps this table by hand as kOverworldAreaHeads; the cartridge holds it here,
  // and compile-overworld-utils.ts reads the same 64 bytes.
  const areaHeads: number[] = [];
  for (let i = 0; i < AREA_COUNT; i++) areaHeads.push(byteAt(0x82a5ec + i));
  const headOf = (area: number): number =>
    area >= SPECIAL_SCREEN_FIRST ? area : areaHeads[area & 0x3f] | (area & 0x40);
  const isAreaHead = (area: number): boolean => headOf(area) === area;

  // assets.h:33 kEntranceData_rooms, :53 kEntranceData_palace. 133 entries each.
  const entranceRooms: number[] = [];
  const entrancePalaces: number[] = [];
  for (let i = 0; i < ENTRANCE_COUNT; i++) {
    entranceRooms.push(wordAt(0x82c813 + i * 2));
    entrancePalaces.push(signedAt(0x82d48b + i));
  }

  // A slot's position is a byte offset into the area's map16 tilemap: 2 bytes a tile, 64 a row,
  // so the tile is `pos >> 1` and the row is `pos >> 7`. Both tables are already 16px aligned:
  // overworld.c:871 sets overworld_offset_mask_y to 0x3f0 (0x1f0 for a small area) and
  // overworld_offset_mask_x to a third of that, which clears the sub-tile bits before the
  // position is ever stored, so no correction belongs here.
  const tileOf = (pos: number): { x: number; y: number } => ({ x: (pos >> 1) & 0x3f, y: (pos >> 7) & 0x3f });
  const screenOf = (area: number, x: number, y: number): number =>
    area >= SPECIAL_SCREEN_FIRST ? area : area + (x >> 5) + (y >> 5) * 8;

  const mouths: RomMouth[] = [];
  // assets.h:250-255 kOverworld_Entrance_Area / _Pos / _Id, read as overworld.c:265 reads them.
  for (let i = 0; i < OW_ENTRANCE_SLOTS; i++) {
    const area = wordAt(0x9bb96f + i * 2);
    const { x, y } = tileOf(wordAt(0x9bba71 + i * 2));
    mouths.push({ table: 'entrance', slot: i, entranceId: byteAt(0x9bbb73 + i), area, screen: screenOf(area, x, y), x, y });
  }
  // assets.h:256-261 kFallHole_Pos / _Area / _Entrances, as overworld.c:3210 pairs them.
  // Overworld_GetPitDestination builds the same `pos` as Overworld_UseEntrance and compares it
  // to the stored word unchanged, so the two tables decode the same way.
  for (let i = 0; i < HOLE_SLOTS; i++) {
    const area = wordAt(0x9bb826 + i * 2);
    const { x, y } = tileOf(wordAt(0x9bb800 + i * 2));
    mouths.push({ table: 'hole', slot: i, entranceId: byteAt(0x9bb84c + i), area, screen: screenOf(area, x, y), x, y });
  }

  // assets.h:262-265 kExitDataRooms / _ScreenIndex, plus the landing coords at :272-275.
  const exits: RomExit[] = [];
  for (let i = 0; i < EXIT_SLOTS; i++) {
    const screenIndex = byteAt(0x82de28 + i);
    exits.push({
      index: i,
      room: wordAt(0x82dd8a + i * 2),
      screenIndex,
      x: wordAt(0x82e0ef + i * 2) - ((screenIndex & 7) << 9),
      y: wordAt(0x82e051 + i * 2) - ((screenIndex & 56) << 6),
    });
  }

  // dungeon.c:3700 GetRoomHeaderPtr, through the pointer table extract-resources reads at $04F502.
  const roomTravel = (room: number): RomRoomTravel => {
    let header = 0x40000 | wordAt(0x4f502 + room * 2);
    if (header === 0x4ffef) header = 0x82edc5;
    const page = room & 0xff00;
    return {
      holeDest: page | byteAt(header + 9),
      stairDest: [0, 1, 2, 3].map((n) => page | byteAt(header + 10 + n)),
      tags: [byteAt(header + 5), byteAt(header + 6)],
    };
  };

  // messaging.c:1717 DungeonMap_DrawSingleRowOfRooms walks kDungMap_FloorLayout, one palace per
  // entry, 25 bytes a floor, 0xf where the map draws nothing. compile-dungeons.ts reads the same
  // pointer table at $8AF605 and carries the same per-palace sizes.
  const palaceOfRoom = new Map<number, number>();
  for (let palace = 0; palace < DUNGEON_MAP_SIZES.length; palace++) {
    const base = DUNGEON_MAP_BANK + wordAt(0x8af605 + palace * 2);
    for (let cell = 0; cell < DUNGEON_MAP_SIZES[palace]; cell++) {
      const room = byteAt(base + cell);
      if (room !== DUNGEON_MAP_EMPTY) palaceOfRoom.set(room, palace * 2);
    }
  }

  return { areaHeads, entranceRooms, entrancePalaces, mouths, exits, isAreaHead, headOf, palaceOfRoom, roomTravel };
};

export { readRomNativeTables, stripCopierHeader };
export type { RomExit, RomMouth, RomNativeTables, RomRoomTravel };
