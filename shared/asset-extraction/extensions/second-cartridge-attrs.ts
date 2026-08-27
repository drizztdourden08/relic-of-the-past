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

/**
 * The banks and edges of the dungeon's water, and the same problem again.
 *
 * The base game's table calls these four a ledge, which is what the art used to be, and a ledge
 * is a thing the player is thrown over: swimming into one hops him out of the water wherever he
 * happens to be touching it, and against a wall that lands him somewhere he should never be.
 *
 * They are the pool's rim, so they are wall. Making them merely walkable was tried and is worse
 * than the ledge was - it opens the whole rim, and a swimmer can push through it onto the floor.
 * The way out of the water is the ladder run below, and nowhere else.
 */
const WATER_RIM_TILES = [0x43, 0x50, 0x51, 0x53];

const TILE_ATTR_OVERRIDES: readonly { tile: number; attr: number }[] =
  [...WALL_ART_TILES, ...WATER_RIM_TILES].map(tile => ({ tile, attr: WALL }));

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
const waterOverlay = (room: DungeonRoomRecord): AttrOverlayCell[] => {
  const surface = room.layers[1];
  const floor = room.layers[0];
  if (!surface || !floor) return [];
  const cells: AttrOverlayCell[] = [];
  for (let cell = 0; cell < surface.snesWords.length; cell++) {
    const tile = surface.snesWords[cell] & 0x3ff;
    if (tile < WATER_TILE_FIRST || tile > WATER_TILE_LAST) continue;
    cells.push({ layer: 0, cell, attr: DEEP_WATER });
  }
  return cells;
};

/**
 * Where a swimmer can climb back out, as column/row pairs on the bank.
 *
 * Indoors there is no general way out of deep water: the engine's probe reports a normal
 * tile for plain floor only outdoors, so the hop out is driven by the short water ladder
 * (or a staircase) and nothing else.
 *
 * The run is wider than the ledge looks. A vertical move probes three points across the
 * player's 16-pixel width (+0, +8, +15), all three of which must read the ladder, so a pair
 * of cells only lets the hop fire on an exact 8-pixel alignment. One cell of margin either
 * side turns that into a landing window the player can actually hit.
 */
const WATER_LEDGES: Readonly<Record<number, readonly (readonly [number, number])[]>> = {
  // Two of them, both at a staircase: the pool's south bank, and the foot of the north stair.
  // The columns are the port's own: its collision array marks each run's two ends with a code of
  // its own (cols 47-50 south, 41-44 north), which is how the north one was found at all.
  //
  // Only the middle pair of each run is the way up. The ends are the stair's own sides, and left
  // open they are a hole in the rim wide enough to push through and end up walking on the floor
  // of the pool, so they are closed below.
  0xdd: [
    [48, 54], [49, 54],
    [42, 12], [43, 12],
  ],
};

/** The sides of each stair: rim, not opening. */
const WATER_LEDGE_SIDES: Readonly<Record<number, readonly (readonly [number, number])[]>> = {
  0xdd: [
    [47, 54], [50, 54],
    [41, 12], [44, 12],
  ],
};

/**
 * Both layers, because a swimmer reads the lower one: the engine moves the player there the
 * moment all four of its probes read deep water. The room's two levels are kept in step
 * anyway, so this is belt and braces rather than the only thing carrying the ledge across.
 */
const ledgeOverlay = (room: DungeonRoomRecord): AttrOverlayCell[] => {
  const cell = (column: number, row: number, attr: number): AttrOverlayCell[] =>
    ([0, 1] as const).map(layer => ({ layer, cell: row * 64 + column, attr }));
  return [
    ...(WATER_LEDGES[room.id] ?? []).flatMap(([column, row]) => cell(column, row, WATER_LADDER)),
    ...(WATER_LEDGE_SIDES[room.id] ?? []).flatMap(([column, row]) => cell(column, row, WALL)),
  ];
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
  const cells = [...(build ? build() : []), ...waterOverlay(room), ...ledgeOverlay(room)];
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
