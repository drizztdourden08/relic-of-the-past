/* @layer shared-asset-extraction @kind data */
/**
 * Attribute overlay: per-cell corrections applied after a room's collision installs.
 *
 * The port's own collision arrays are the source of truth for the baked rooms, but two kinds
 * of cell need translation into this engine's attribute language: exit doorways (the native
 * doorway stripe value the exit tables key on) and cells the collision conversion still gets
 * wrong (the entrance chamber's side-wall columns — the conversion gap is tracked separately;
 * these records make the correction explicit data instead of code).
 *
 * Format per record: layer byte, cell low byte, cell high byte, attribute byte.
 */

import type { DungeonRoomRecord } from '../dungeon/model';

interface AttrOverlayCell {
  layer: 0 | 1;
  cell: number;
  attr: number;
}

// 0x01, not 0x02: the engine's simplified sprite tile table treats 0x02 as passable, so a
// 0x02 wall blocks the player but lets most enemies walk straight through it.
const WALL = 0x01;

/**
 * Tile-level attribute corrections, applied to attributes_for_tile for every bank room.
 * The port re-drew these ids as wall crenellation, but their vanilla attributes (which the
 * engine's per-tile table still carries outside the aux region) are walkable - measured as
 * pass-through gaps in the hub's and chamber's outer walls.
 */
const WALL_ART_TILES = [
  0x15,
  0x90, 0x91, 0x92, 0x93, 0x94, 0x96, 0x97, 0x9e,
  0xa2, 0xa3, 0xa4, 0xa5, 0xa6,
  0x100, 0x101, 0x110, 0x111, 0x112, 0x113, 0x11c,
  0x12c, 0x18e, 0x18f, 0x19e, 0x19f,
];

const TILE_ATTR_OVERRIDES: readonly { tile: number; attr: number }[] =
  WALL_ART_TILES.map(tile => ({ tile, attr: WALL }));

const tileAttrOverridesRecord = (): Buffer => {
  const record = Buffer.alloc(TILE_ATTR_OVERRIDES.length * 3);
  TILE_ATTR_OVERRIDES.forEach(({ tile, attr }, i) => {
    record.writeUInt16LE(tile, i * 3);
    record[i * 3 + 2] = attr;
  });
  return record;
};
const DOORWAY_STRIPE = 0x8e;
const DEEP_WATER = 0x08;
// The engine's short water ladder: a water cell the player can climb out onto.
const WATER_LADDER = 0x0a;

// The surface tiles the cartridge animates for water; every cell drawn with one is swimmable.
const WATER_TILE_FIRST = 0x1b6;
const WATER_TILE_LAST = 0x1b9;

/**
 * Water is a property of the cells the water surface is drawn on, so it is derived from the
 * room rather than listed by hand. Without it the surface is plain floor: the player walks
 * across it, and the room's current has nothing to carry.
 */
/**
 * Where the water can be climbed out of, as column/row pairs on the water's own cells.
 *
 * Only these spots: the rest of the bank is scenery the player swims past, so a rule derived
 * from the surrounding floor turns the whole pool into something walkable instead.
 */
const WATER_LADDERS: Readonly<Record<number, readonly (readonly [number, number])[]>> = {
  // The pool's south bank, at the head of the staircase.
  0xdd: [[38, 53], [39, 53]],
};

const waterOverlay = (room: DungeonRoomRecord): AttrOverlayCell[] => {
  const surface = room.layers[1];
  const floor = room.layers[0];
  if (!surface || !floor) return [];
  const isWater = (cell: number): boolean => {
    if (cell < 0 || cell >= surface.snesWords.length) return false;
    const tile = surface.snesWords[cell] & 0x3ff;
    return tile >= WATER_TILE_FIRST && tile <= WATER_TILE_LAST;
  };
  const ladders = WATER_LADDERS[room.id] ?? [];
  const cells: AttrOverlayCell[] = [];
  for (let cell = 0; cell < surface.snesWords.length; cell++) {
    if (!isWater(cell)) continue;
    const climbOut = ladders.some(([column, row]) => row * 64 + column === cell);
    cells.push({ layer: 0, cell, attr: climbOut ? WATER_LADDER : DEEP_WATER });
  }
  return cells;
};

/** The entrance chamber: side walls the conversion leaves walkable, and the south exit stripe. */
const entranceChamberOverlay = (): AttrOverlayCell[] => {
  const cells: AttrOverlayCell[] = [];
  for (let row = 4; row <= 61; row++) {
    cells.push({ layer: 0, cell: row * 64 + 19, attr: WALL });
    cells.push({ layer: 0, cell: row * 64 + 44, attr: WALL });
  }
  for (let row = 59; row <= 63; row++) {
    cells.push({ layer: 0, cell: row * 64 + 31, attr: DOORWAY_STRIPE });
    cells.push({ layer: 0, cell: row * 64 + 32, attr: DOORWAY_STRIPE });
  }
  return cells;
};

/**
 * The hub: its north-wall door art has no door record and no room behind it - walking the
 * passage would edge-transition into the sealed void. Close the alcove at the wall line.
 */
const hubOverlay = (): AttrOverlayCell[] => {
  const cells: AttrOverlayCell[] = [];
  for (let row = 4; row <= 6; row++) {
    for (let col = 30; col <= 33; col++) cells.push({ layer: 0, cell: row * 64 + col, attr: WALL });
  }
  return cells;
};

const OVERLAYS: Readonly<Record<number, () => AttrOverlayCell[]>> = {
  0x78: hubOverlay,
  0x88: entranceChamberOverlay,
};

const attrOverlayRecord = (room: DungeonRoomRecord): Buffer => {
  const build = OVERLAYS[room.id];
  const cells = [...(build ? build() : []), ...waterOverlay(room)];
  if (cells.length === 0) return Buffer.alloc(0);
  const record = Buffer.alloc(cells.length * 4);
  cells.forEach(({ layer, cell, attr }, i) => {
    record[i * 4] = layer;
    record.writeUInt16LE(cell, i * 4 + 1);
    record[i * 4 + 3] = attr;
  });
  return record;
};

export { attrOverlayRecord, tileAttrOverridesRecord };
export type { AttrOverlayCell };
