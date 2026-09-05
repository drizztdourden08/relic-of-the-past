/* @layer bridge-wasm @kind logic */
/**
 * Walls the run has blown open.
 *
 * `Bomb_CheckForDestructibles` (dungeon.c:5170) is the ground truth: an interior attr of
 * `0xF0 | j` marks "destructible door slot `j` is here", opened when that slot's type masks
 * to 0x28, 0x2A or 0x2E. The attr appears on BOTH faces of the wall (the village well has
 * `0xF0` at rows 37-38 and `0xF8` at rows 27-28, eight rows of wall between).
 *
 * A blast radius is the wrong model: it leaves the wall's interior solid. A blast PIERCES a
 * corridor the marker's width straight through to the floor on the far side. The carve is
 * conservative: plain wall and door markers only, one axis, the marker's width, and only if
 * it reaches open floor within `MAX_WALL_DEPTH`; a tunnel that never surfaces is discarded.
 *
 * This is sim-side state, not a game write: a real bomb's tilemap swap has no addressable
 * equivalent. The widget reads the same registry so both agree. Bombs are permanent once
 * obtained; no count is kept.
 */
import type { GridPos } from '@shared/game/navigation';

/** Destructible-door markers: `0xF0 | slot` (see Bomb_CheckForDestructibles). */
const BOMBABLE_ATTR_MIN = 0xf0;
const BOMBABLE_ATTR_MAX = 0xff;
/** Attrs a blast may consume: plain interior wall in its two flavours. */
const WALL_ATTRS = new Set([0x01, 0x04]);
/** Deepest wall a single blast pierces. Beyond this it is rock, not a wall. */
const MAX_WALL_DEPTH = 16;
const GRID = 64;
const NEIGHBOURS = [[-1, 0], [1, 0], [0, -1], [0, 1]] as const;

/** Blast seeds per room. The carve needs the grids, so it happens at stamp time. */
const seeds = new Map<number, GridPos[]>();
/** Cells the carve opened, so `isBombed` answers after the fact. */
const opened = new Map<number, Set<string>>();

const cellKey = (row: number, col: number): string => `${row},${col}`;

const isBombableAttr = (attr: number): boolean => attr >= BOMBABLE_ATTR_MIN && attr <= BOMBABLE_ATTR_MAX;
/** A blast may eat through a wall or another marker. */
const isPierceable = (attr: number): boolean => WALL_ATTRS.has(attr) || isBombableAttr(attr);

/** Record a blast at `tile` in `roomId`. */
const markBombed = (roomId: number, tile: GridPos): void => {
  seeds.set(roomId, [...(seeds.get(roomId) ?? []), tile]);
};

const isBombed = (roomId: number, tile: GridPos): boolean =>
  opened.get(roomId)?.has(cellKey(tile.row, tile.col)) === true;

/** The contiguous run of marker cells the blast landed on, 4-connected. */
const markerPatch = (grid: number[][], tile: GridPos): GridPos[] => {
  const seen = new Set<string>([cellKey(tile.row, tile.col)]);
  const patch: GridPos[] = [];
  const queue: GridPos[] = [tile];
  while (queue.length > 0) {
    const cur = queue.shift() as GridPos;
    if (!isBombableAttr(grid[cur.row]?.[cur.col] ?? 0)) continue;
    patch.push(cur);
    for (const [dr, dc] of NEIGHBOURS) {
      const row = cur.row + dr;
      const col = cur.col + dc;
      const key = cellKey(row, col);
      if (row < 0 || row >= GRID || col < 0 || col >= GRID || seen.has(key)) continue;
      seen.add(key);
      queue.push({ row, col });
    }
  }
  return patch;
};

/** Walk `lanes` outward from `start` along one axis, eating wall, and return the cells crossed once open floor is reached. Empty means rock, nothing opened. */
const pierce = (grid: number[][], lanes: number[], start: number, step: number, vertical: boolean): GridPos[] => {
  const cells: GridPos[] = [];
  for (let d = 1; d <= MAX_WALL_DEPTH; d++) {
    const at = start + step * d;
    if (at < 0 || at >= GRID) return [];
    const attrs = lanes.map((lane) => (vertical ? grid[at]?.[lane] : grid[lane]?.[at]) ?? 0x01);
    // Every lane open: the far side is reached.
    if (attrs.every((a) => !isPierceable(a))) return cells;
    for (const lane of lanes) cells.push(vertical ? { row: at, col: lane } : { row: lane, col: at });
  }
  return [];
};

/** Every cell one blast opens: the marker itself plus the corridor it pierces. */
const carve = (grid: number[][], tile: GridPos): GridPos[] => {
  const patch = markerPatch(grid, tile);
  if (patch.length === 0) return [];
  const rows = patch.map((c) => c.row);
  const cols = patch.map((c) => c.col);
  const colLanes = [...new Set(cols)].sort((a, b) => a - b);
  const rowLanes = [...new Set(rows)].sort((a, b) => a - b);
  // A marker sits on one face, so both ends of the axis are pierced.
  return [
    ...patch,
    ...pierce(grid, colLanes, Math.min(...rows), -1, true),
    ...pierce(grid, colLanes, Math.max(...rows), +1, true),
    ...pierce(grid, rowLanes, Math.min(...cols), -1, false),
    ...pierce(grid, rowLanes, Math.max(...cols), +1, false),
  ];
};

/** Open every recorded blast, in every layer, on the way out of a grid build. */
const stampBombedWalls = (roomId: number, grids: number[][][]): void => {
  const blasts = seeds.get(roomId);
  if (!blasts || grids.length === 0) return;
  const set = opened.get(roomId) ?? new Set<string>();
  for (const tile of blasts) {
    for (const grid of grids) {
      for (const cell of carve(grid, tile)) {
        grid[cell.row][cell.col] = 0x00;
        set.add(cellKey(cell.row, cell.col));
      }
    }
  }
  opened.set(roomId, set);
};

/** Cleared between runs so one run's blasts never leak into the next. */
const resetBombedWalls = (): void => { seeds.clear(); opened.clear(); };

export { markBombed, isBombed, stampBombedWalls, resetBombedWalls, isBombableAttr, BOMBABLE_ATTR_MIN, BOMBABLE_ATTR_MAX };
