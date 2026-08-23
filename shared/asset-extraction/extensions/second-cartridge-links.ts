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
 * Values match what the engine needs for a single-viewport room entered from its south
 * doorway. `relativeCoords` are stored as high bytes: the engine reconstructs the room
 * bounds as `value << 8` (with the two y-maxima carrying a `| 0x10`).
 */
const appendExtraEntrance = (a: EntranceArrays): void => {
  if (a.rooms.length !== BASE_ENTRANCE_COUNT) {
    throw new Error(`Expected ${BASE_ENTRANCE_COUNT} base entrance records, found ${a.rooms.length}`);
  }
  a.rooms.push(EXTRA_DUNGEON_ROOM);
  a.scrollX.push(0x1080);
  a.scrollY.push(0x1110);
  a.playerX.push(0x10f8);
  a.playerY.push(0x11d8);
  a.cameraX.push(0x7f);
  a.cameraY.push(0x187);
  a.blockset.push(0);
  a.floor.push(0);
  a.palace.push(-1); // 0xff — not a numbered palace
  a.doorway.push(1); // standing in a doorway on entry
  a.startBg.push(0);
  a.quad1.push(0x02); // quadrant_fullsize x=0, y=2
  a.quad2.push(0x12); // link_quadrant x=1, y=2
  a.doorSettings.push(0);
  a.music.push(0x10);
  // y: a0, b0, a1, b1 then x: a0, b0, a1, b1 — one 512px-wide, 256px-tall room.
  a.relCoords.push(0x11, 0x10, 0x11, 0x11, 0x10, 0x10, 0x11, 0x11);
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
