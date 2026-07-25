/* @layer bridge-wasm @kind logic */
/**
 * Walk-distance ordering for detected exits: a plain BFS over the flood's
 * reached cells gives the real number of steps from Link's entry tile to each
 * exit, so the simulator always tries the CLOSEST way out first — exactly what
 * a player standing at that spot would do.
 */
import type { GridPos } from '@shared/game/navigation';
import type { ReachState } from '@shared/game/navigation/types';
import type { SimExit } from '@shared/game/simulation';

const GRID = 64;
const UNREACHED = 0xffff;
/** Steps stamped on tiles the flood reached but the walk-BFS can't (across
 *  one-way ledge hops): still reachable, just sorted after real walks. */
const HOP_STEPS = 999;

/** Steps-to-walk from `start` to every reached cell (UNREACHED elsewhere).
 *  The start itself may sit on a non-reached tile (door thresholds, spawn
 *  markers) — seed from every reached tile in a small ring around it too. */
const stepDistances = (reachable: ReachState[][], start: GridPos): Uint16Array => {
  const dist = new Uint16Array(GRID * GRID).fill(UNREACHED);
  const inGrid = (r: number, c: number) => r >= 0 && r < GRID && c >= 0 && c < GRID;
  if (!inGrid(start.row, start.col)) return dist;
  const queue: number[] = [start.row * GRID + start.col];
  dist[queue[0]] = 0;
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const r = start.row + dr;
      const c = start.col + dc;
      if (!inGrid(r, c) || (reachable[r]?.[c] ?? 0) <= 0) continue;
      const idx = r * GRID + c;
      if (dist[idx] === UNREACHED) {
        dist[idx] = Math.max(Math.abs(dr), Math.abs(dc));
        queue.push(idx);
      }
    }
  }
  for (let head = 0; head < queue.length; head++) {
    const cur = queue[head];
    const r = Math.floor(cur / GRID);
    const c = cur % GRID;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
      const nr = r + dr;
      const nc = c + dc;
      if (!inGrid(nr, nc) || (reachable[nr]?.[nc] ?? 0) <= 0) continue;
      const idx = nr * GRID + nc;
      if (dist[idx] !== UNREACHED) continue;
      dist[idx] = dist[cur] + 1;
      queue.push(idx);
    }
  }
  // Flood-reached tiles the walk couldn't touch lie across one-way hops
  // (ledge drops seed the flood but aren't step-adjacent) — keep them
  // reachable for exit detection, just sorted after every real walk.
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const idx = r * GRID + c;
      if ((reachable[r]?.[c] ?? 0) > 0 && dist[idx] === UNREACHED) dist[idx] = HOP_STEPS;
    }
  }
  return dist;
};

/** Distance to a tile, tolerating exits whose own tiles are solid (nearest ring).
 *  Radius 4 covers doorway notches — their door tiles run ~4 deep into the wall,
 *  with the first walkable tile that far from the recorded door position. */
const distanceAt = (dist: Uint16Array, tile: GridPos): number => {
  let best = UNREACHED;
  for (let dr = -4; dr <= 4; dr++) {
    for (let dc = -4; dc <= 4; dc++) {
      const r = tile.row + dr;
      const c = tile.col + dc;
      if (r < 0 || r >= GRID || c < 0 || c >= GRID) continue;
      const d = dist[r * GRID + c];
      if (d < best) best = d;
    }
  }
  return best;
};

/** Exits LEAVING a big multi-sub-screen area sort after every in-area exit, so
 *  the whole big screen gets explored before moving on. */
const AREA_EXIT_BIAS = 0x1000;

/**
 * Sort exits by walk-steps from the entry tile. `scores` carries a precomputed
 * score per exit (same array order) — pass REMOTE_SCREEN_PENALTY-based scores
 * for exits that live on other sub-screens of a big area. Each exit keeps its
 * score as `steps` so the log can show the ordering evidence.
 */
const sortExitsByDistance = (exits: SimExit[], scores: number[]): SimExit[] =>
  exits
    .map((exit, i) => ({ exit: { ...exit, steps: scores[i] ?? UNREACHED }, score: scores[i] ?? UNREACHED }))
    .sort((a, b) => a.score - b.score)
    .map((e) => e.exit);

type EdgeName = 'north' | 'south' | 'west' | 'east';

/**
 * Walk-distance to a DOORWAY on a wall: scan inward from the wall at the door
 * position (±4 tiles wide, up to 14 deep — notch depth and the door record's
 * lateral offset both vary) and return the first reached tile's distance.
 * UNREACHED when the doorway's side of the room was never flooded (e.g. it
 * sits behind an internal locked door).
 */
const doorwayDistance = (dist: Uint16Array, edge: EdgeName, pos: number): number => {
  for (let depth = 0; depth <= 14; depth++) {
    for (let dpos = -4; dpos <= 4; dpos++) {
      const p = pos + dpos;
      if (p < 0 || p >= GRID) continue;
      const r = edge === 'north' ? depth : edge === 'south' ? GRID - 1 - depth : p;
      const c = edge === 'west' ? depth : edge === 'east' ? GRID - 1 - depth : p;
      const d = dist[r * GRID + c];
      if (d < UNREACHED) return d;
    }
  }
  return UNREACHED;
};

/** Landing tile on the DESTINATION screen when crossing an edge at `pos`. */
const entryFromEdge = (edge: EdgeName, pos: number): GridPos =>
  edge === 'north' ? { row: 63, col: pos }
  : edge === 'south' ? { row: 0, col: pos }
  : edge === 'west' ? { row: pos, col: 63 }
  : { row: pos, col: 0 };

/** Where an exit physically sits on the SOURCE screen (opposite of entryFromEdge). */
const exitFromEdge = (edge: EdgeName, pos: number): GridPos =>
  edge === 'north' ? { row: 0, col: pos }
  : edge === 'south' ? { row: 63, col: pos }
  : edge === 'west' ? { row: pos, col: 0 }
  : { row: pos, col: 63 };

/** Reach states → plain boolean grid (the engine's region-memory format). */
const reachedGrid = (reachable: ReachState[][]): boolean[][] =>
  reachable.map((row) => row.map((v) => v > 0));

export { stepDistances, distanceAt, doorwayDistance, sortExitsByDistance, entryFromEdge, exitFromEdge, reachedGrid, AREA_EXIT_BIAS };
export type { EdgeName };
