/* @layer bridge-wasm @kind logic */
/**
 * Walk-distance ordering for detected exits: a plain BFS over the flood's
 * reached cells gives the real number of steps from the player's entry tile to each
 * exit, so the simulator always tries the CLOSEST way out first — exactly what
 * a player standing at that spot would do.
 */
import type { GridPos, LedgeTraversal } from '@shared/game/navigation';
import type { ReachState } from '@shared/game/navigation/types';
import type { SimExit } from '@shared/game/simulation';

const GRID = 64;
const UNREACHED = 0xffff;
/** Steps stamped on tiles the flood reached but the walk-BFS still can't, after
 *  ledge hops have been walked: reachable, distance genuinely unknown. */
const HOP_STEPS = 999;
/** Exits LEAVING a big multi-sub-screen area sort after every in-area exit, so
 *  the whole big screen gets explored before moving on. */
const AREA_EXIT_BIAS = 0x1000;
/**
 * A ledge drop is ONE-WAY: the player cannot climb back. Priced as one move it
 * looked almost free, so the ordering happily dropped off a ledge with work
 * still pending on the footing above — and since the screen it left is then
 * marked visited, that work was stranded for the rest of the run.
 *
 * So a hop costs more than any walk on the current footing can (`HOP_STEPS` is
 * already the ceiling a real distance is assumed to stay under). That makes the
 * order lexicographic — every walkable target first, drops afterwards, deepest
 * last — without forbidding the drop.
 */
const LEDGE_COST = HOP_STEPS + 1;

/** Steps-to-walk from `start` to every reached cell (UNREACHED elsewhere).
 *  The start itself may sit on a non-reached tile (door thresholds, spawn
 *  markers) — seed from every reached tile in a small ring around it too. */
const stepDistances = (reachable: ReachState[][], start: GridPos, ledges: readonly LedgeTraversal[] = []): Uint16Array => {
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
  // Ledge drops are ONE-WAY edges the walk must be able to use: a tile only
  // reachable by hopping a ledge has a real distance, not a sentinel. Without
  // this the BFS stops at every ledge and everything beyond sorts arbitrarily.
  const hops = new Map<number, number[]>();
  for (const l of ledges) {
    if (!inGrid(l.startRow, l.startCol) || !inGrid(l.endRow, l.endCol)) continue;
    const from = l.startRow * GRID + l.startCol;
    const to = l.endRow * GRID + l.endCol;
    const list = hops.get(from);
    if (list) list.push(to);
    else hops.set(from, [to]);
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
    for (const to of hops.get(cur) ?? []) {
      if (dist[to] !== UNREACHED) continue;
      // Saturate below the out-of-area bias so a many-hop tile on THIS area
      // still sorts ahead of another sub-screen's exits.
      dist[to] = Math.min(dist[cur] + LEDGE_COST, AREA_EXIT_BIAS - 1);
      queue.push(to);
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

/**
 * Splits an ordering score back into what it means. The score packs three things
 * — real steps, the out-of-area bias and the unknown-distance sentinel — so it
 * must never be shown to a reader verbatim.
 */
const decodeScore = (score: number): Pick<SimExit, 'steps' | 'stepsNote'> => {
  if (score >= UNREACHED) return {};
  if (score >= AREA_EXIT_BIAS) {
    const steps = score - AREA_EXIT_BIAS;
    // Still a real walk, just on another sub-screen of a big area.
    return steps >= HOP_STEPS ? { stepsNote: 'other-screen' } : { steps, stepsNote: 'other-screen' };
  }
  if (score >= HOP_STEPS) return { stepsNote: 'via-hop' };
  return { steps: score };
};

/**
 * Sort exits by walk-steps from the entry tile. `scores` carries a precomputed
 * score per exit (same array order) — pass REMOTE_SCREEN_PENALTY-based scores
 * for exits that live on other sub-screens of a big area. The score is kept for
 * the log's ordering evidence, but `steps` only ever holds a real distance.
 */
const sortExitsByDistance = (exits: SimExit[], scores: number[]): SimExit[] =>
  exits
    .map((exit, i) => {
      const score = scores[i] ?? UNREACHED;
      return { exit: { ...exit, score, ...decodeScore(score) }, score };
    })
    .sort((a, b) => a.score - b.score)
    .map((e) => e.exit);

type EdgeName = 'north' | 'south' | 'west' | 'east';

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

export { stepDistances, distanceAt, sortExitsByDistance, decodeScore, entryFromEdge, exitFromEdge, reachedGrid, AREA_EXIT_BIAS };
export type { EdgeName };
