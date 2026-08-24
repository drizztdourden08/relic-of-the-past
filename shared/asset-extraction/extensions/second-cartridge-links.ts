/* @layer shared-asset-extraction @kind data */
/**
 * Overworld/dungeon wiring for the extra dungeon, expressed as records in the game's own
 * tables rather than as engine special cases.
 *
 * Entering and leaving a place is entirely table-driven in this engine:
 *   kOverworld_Entrance_{Area,Pos,Id}  an overworld cell -> an entrance id
 *   kEntranceData_*                    that id -> room, player/camera/scroll, bounds, music
 *   kExitData_*                        a dungeon room -> where you reappear outside
 * Give the extra dungeon one record in each and every downstream path (entry, exit, music,
 * tagalong checks, the mirror, save-and-quit) works with no code aware of it at all. The
 * earlier approach reimplemented the middle table in C and had no record in the third,
 * which is why leaving needed a hand-tuned coordinate nudge.
 *
 * The overworld and exit records are CLONED from the base game's own Pyramid opening and
 * shifted, so their many opaque fields (map16 load offsets, the two unknown scroll deltas,
 * door settings) stay whatever the original was rather than being guessed at.
 *
 * These records are appended unconditionally, not only when the second cartridge is
 * present. That keeps the base blob identical whether or not a supplement is compiled,
 * and they are unreachable without it: the entrance is only usable once the overworld
 * opening is drawn, and that only happens while the supplement is loaded.
 */

import { MAIN_TILE_THEME } from '../sources/gba-alttp/blockset-identity';
import { EXTRA_DUNGEON_PALACE } from './second-cartridge-map';

/** The base game's Pyramid opening: overworld cell (col 14, row 27) on area 0x5b. */
const PYRAMID_AREA = 0x5b;
const PYRAMID_HOLE_CELL = 27 * 64 + 14;
/** Where the extra dungeon's opening is drawn, from the same row. */
const EXTRA_HOLE_CELL = 27 * 64 + 43;
const CELL_DELTA = EXTRA_HOLE_CELL - PYRAMID_HOLE_CELL;

/** A cell is 16 px wide, and an entrance position is a cell index doubled. */
const POS_DELTA = CELL_DELTA * 2;
const PIXEL_DELTA = CELL_DELTA * 16;

/** The room the Pyramid opening leads to — the exit record we clone is keyed on it. */
const PYRAMID_ROOM = 0x10;

/** The extra dungeon's entrance chamber. */
const EXTRA_DUNGEON_ROOM = 0x88;

/**
 * The base game ships 133 entrance records, so the next free id is 133. Asserted at append
 * time: if the base table ever changes length the build fails loudly instead of silently
 * handing the engine an index that means something else.
 */
const BASE_ENTRANCE_COUNT = 133;
const EXTRA_ENTRANCE_ID = BASE_ENTRANCE_COUNT;

interface EntranceArrays {
  rooms: number[]; relCoords: number[]; scrollX: number[]; scrollY: number[];
  playerX: number[]; playerY: number[]; cameraX: number[]; cameraY: number[];
  blockset: number[]; floor: number[]; palace: number[]; doorway: number[];
  startBg: number[]; quad1: number[]; quad2: number[]; doorSettings: number[]; music: number[];
}

/**
 * One entrance record for the extra dungeon's chamber.
 *
 * Every geometry field is derived from the room's place in the 16x20 room grid rather than
 * measured by hand. Verified against two base-game entrances into full-size rooms: id 19 into
 * room 0xf8 (row 15, column 8) and id 9 into room 0x84 (row 8, column 4) both reproduce
 * exactly from these formulas.
 *
 * Getting `quadrant1` wrong is what made the camera drift: it is read as
 * `quadrant_fullsize_x = value >> 4, quadrant_fullsize_y = value & 0xf`, and a room declared
 * not-full-size horizontally is treated as two 256px pages, so the background scrolls past the
 * room's edge and wraps.
 */

/** A room is 0x200 by 0x200, and the grid is 16 wide. */
const ROOM_SPAN = 0x200;
const ROOMS_PER_GRID_ROW = 16;

/** Both axes full size — one viewport, no page split. */
const QUADRANT_FULLSIZE_BOTH = 0x22;
/** The player arrives in the left half of the room, lower vertical quadrant. */
const PLAYER_QUADRANT = 0x02;

/** Where the player and camera sit relative to the room's own origin. */
const PLAYER_OFFSET_X = 0xf8;
const PLAYER_OFFSET_Y = 0x1d8;
const SCROLL_OFFSET_X = 0x80;
const SCROLL_OFFSET_Y = 0x110;
const CAMERA_THRESHOLD_X = 0xff;
const CAMERA_THRESHOLD_Y = 0x187;

const appendExtraEntrance = (a: EntranceArrays): void => {
  if (a.rooms.length !== BASE_ENTRANCE_COUNT) {
    throw new Error(`Expected ${BASE_ENTRANCE_COUNT} base entrance records, found ${a.rooms.length}`);
  }
  const row = Math.floor(EXTRA_DUNGEON_ROOM / ROOMS_PER_GRID_ROW);
  const column = EXTRA_DUNGEON_ROOM % ROOMS_PER_GRID_ROW;
  const originX = column * ROOM_SPAN;
  const originY = row * ROOM_SPAN;

  a.rooms.push(EXTRA_DUNGEON_ROOM);
  a.scrollX.push(originX + SCROLL_OFFSET_X);
  a.scrollY.push(originY + SCROLL_OFFSET_Y);
  a.playerX.push(originX + PLAYER_OFFSET_X);
  a.playerY.push(originY + PLAYER_OFFSET_Y);
  a.cameraX.push(CAMERA_THRESHOLD_X);
  a.cameraY.push(CAMERA_THRESHOLD_Y);
  a.blockset.push(MAIN_TILE_THEME); // the engine reads this as main_tile_theme_index
  a.floor.push(0);
  a.palace.push(EXTRA_DUNGEON_PALACE); // a real dungeon: map screen, HUD slots, banked keys
  a.doorway.push(1); // standing in a doorway on entry
  a.startBg.push(0);
  a.quad1.push(QUADRANT_FULLSIZE_BOTH);
  a.quad2.push(PLAYER_QUADRANT);
  a.doorSettings.push(0);
  a.music.push(0x10);
  // Room bounds, as high bytes the engine shifts back up. y first, then x; each pair is one
  // quadrant's low and high edge, in half-room units.
  const halfRoomsY = row * 2;
  const halfRoomsX = column * 2;
  a.relCoords.push(
    halfRoomsY + 1, halfRoomsY, halfRoomsY + 1, halfRoomsY + 1,
    halfRoomsX, halfRoomsX, halfRoomsX, halfRoomsX + 1,
  );
};

/** Register the opening's overworld cell, cloned from the Pyramid's own entry. */
const appendExtraOverworldEntrance = (area: number[], pos: number[], id: number[]): void => {
  const source = pos.findIndex((p, i) => p === PYRAMID_HOLE_CELL * 2 && area[i] === PYRAMID_AREA);
  if (source < 0) {
    throw new Error(`No overworld entrance at the Pyramid opening (area 0x${PYRAMID_AREA.toString(16)}, cell ${PYRAMID_HOLE_CELL})`);
  }
  area.push(PYRAMID_AREA);
  pos.push(pos[source] + POS_DELTA);
  id.push(EXTRA_ENTRANCE_ID);
};

interface ExitArrays {
  screen: number[]; rooms: number[]; loadOff: number[]; scrollX: number[]; scrollY: number[];
  x: number[]; y: number[]; camX: number[]; camY: number[];
  nDoor: number[]; fDoor: number[]; unk1: number[]; unk3: number[];
}

/**
 * Where the player reappears on leaving. Cloned from the Pyramid's exit and shifted east by
 * the same distance the opening was, so the scroll, camera and door fields stay coherent
 * with each other instead of being invented one at a time.
 */
const appendExtraExit = (a: ExitArrays): void => {
  const source = a.rooms.indexOf(PYRAMID_ROOM);
  if (source < 0) throw new Error(`No exit record for room 0x${PYRAMID_ROOM.toString(16)} to clone`);

  a.screen.push(a.screen[source]);
  a.rooms.push(EXTRA_DUNGEON_ROOM);
  // Position-derived, not a constant: the engine recomputes the map16 load column from this
  // (`(off - 0x10 & 0x3e) >> 1`), so cloning it unshifted loads the Pyramid's column of tiles
  // at our position and the screen comes back as garbage.
  a.loadOff.push(a.loadOff[source] + POS_DELTA);
  a.scrollX.push(a.scrollX[source] + PIXEL_DELTA);
  a.scrollY.push(a.scrollY[source]);
  a.x.push(a.x[source] + PIXEL_DELTA);
  a.y.push(a.y[source]);
  a.camX.push(a.camX[source] + PIXEL_DELTA);
  a.camY.push(a.camY[source]);
  a.nDoor.push(a.nDoor[source]);
  a.fDoor.push(a.fDoor[source]);
  a.unk1.push(a.unk1[source]);
  a.unk3.push(a.unk3[source]);
};

export { EXTRA_DUNGEON_ROOM, EXTRA_ENTRANCE_ID, appendExtraEntrance, appendExtraExit, appendExtraOverworldEntrance };
export type { EntranceArrays, ExitArrays };
