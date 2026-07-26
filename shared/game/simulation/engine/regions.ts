/* @layer shared-game @kind logic */
/**
 * Region-aware exploration memory. A room can hold several walkable regions
 * that don't connect internally (the castle hall vs. its stair landing); a
 * screen-id visited set alone would mark the whole room explored after seeing
 * one region. The engine keeps a per-screen union of every flood's reached
 * tiles, and treats an entry landing OUTSIDE that union as a fresh visit.
 */
import type { GridPos } from '../../navigation/types';
import type { SimExit } from '../types';
import { findDiscoveredPath } from './discovered-graph';
import type { EngineState } from './state';

const GRID = 64;
/** Landing tiles sit on walls/door notches; scan a window around them. */
const WINDOW = 3;

/** Merge a screen's newly-flooded reach into its run-wide union. */
const unionReach = (map: Map<string, boolean[][]>, screenId: string, reached: boolean[][]): void => {
  const prev = map.get(screenId);
  if (!prev) {
    map.set(screenId, reached.map((row) => [...row]));
    return;
  }
  map.set(screenId, prev.map((row, r) => row.map((v, c) => v || (reached[r]?.[c] ?? false))));
};

/** Mark an attempted entry point as explored, so a landing whose flood cannot
 *  reach its own doorway never re-queues the same screen forever. */
const stampReach = (map: Map<string, boolean[][]>, screenId: string, tile: GridPos): void => {
  const grid = map.get(screenId) ?? Array.from({ length: GRID }, () => new Array<boolean>(GRID).fill(false));
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const r = tile.row + dr;
      const c = tile.col + dc;
      if (r >= 0 && r < GRID && c >= 0 && c < GRID) grid[r][c] = true;
    }
  }
  map.set(screenId, grid);
};

/** Whether a landing tile falls inside the screen's already-explored region.
 *  Screens with no recorded reach are treated as fully covered (atomic). */
const regionCovered = (map: Map<string, boolean[][]>, screenId: string, tile?: GridPos): boolean => {
  const grid = map.get(screenId);
  if (!grid || !tile) return true;
  for (let dr = -WINDOW; dr <= WINDOW; dr++) {
    for (let dc = -WINDOW; dc <= WINDOW; dc++) {
      const r = tile.row + dr;
      const c = tile.col + dc;
      if (r < 0 || r >= GRID || c < 0 || c >= GRID) continue;
      if (grid[r][c]) return true;
    }
  }
  return false;
};

interface RegionJob {
  /** Screen holding the exit into the unexplored region. */
  from: string;
  to: string;
  /** Which way in, so traverse takes THAT exit and not another to the same screen. */
  edgeSig?: string;
}

/** Identity of an arrival: the destination plus the way in. */
const arrivalKey = (to: string, edgeSig?: string): string => `${to}#${edgeSig ?? 'x'}`;

/**
 * Is this way in already accounted for?
 *
 * Either we have used it, or it lands inside ground we already explored — a
 * screen has several edges on one side and most of them drop you in the same
 * place, so there is nothing to learn by walking each one. What must NOT be
 * skipped is an edge landing OUTSIDE the explored region: the sanctuary grounds
 * hold a ledge the lower part cannot reach, so entering from the sanctuary door
 * floods 1762 tiles and entering from the screen to the west floods 2139. Those
 * are two different places behind one screen id.
 */
const arrivalAccountedFor = (
  arrivals: Set<string>,
  map: Map<string, boolean[][]>,
  exit: SimExit,
): boolean =>
  arrivals.has(arrivalKey(exit.to, exit.edgeSig)) || regionCovered(map, exit.to, exit.entryTile);

/** Visited screens some discovered exit enters OUTSIDE their explored region —
 *  multi-region rooms still owe a visit through that specific doorway. */
const unexploredRegionJobs = (
  discovered: Map<string, SimExit[]>,
  map: Map<string, boolean[][]>,
  visited: Set<string>,
  arrivals: Set<string>,
): RegionJob[] => {
  const out: RegionJob[] = [];
  const seen = new Set<string>();
  for (const [from, exits] of discovered) {
    for (const exit of exits) {
      if (!visited.has(exit.to) || !exit.entryTile) continue;
      if (arrivalAccountedFor(arrivals, map, exit)) continue;
      const key = `${from}->${arrivalKey(exit.to, exit.edgeSig)}`;
      if (!seen.has(key)) { seen.add(key); out.push({ from, to: exit.to, edgeSig: exit.edgeSig }); }
    }
  }
  return out;
};

/** Route for the next plannable region job: walk to the job's source screen,
 *  then take ITS exit into the unexplored region (routing plainly to the target
 *  screen would re-enter through the already-explored door). */
const takeRegionJob = (s: EngineState): string[] | null => {
  while (s.regionJobs.length > 0) {
    const job = s.regionJobs.shift()!;
    const path = findDiscoveredPath(s.discovered, s.virtual.screenId, job.from);
    if (path) {
      // Pin the way in: several exits can lead to the same screen, and arriving
      // through the wrong one would leave this job forever unsatisfied.
      s.pendingEdgeSig = job.edgeSig ?? null;
      return [...path.slice(1), job.to];
    }
  }
  return null;
};

export { unionReach, stampReach, regionCovered, arrivalKey, arrivalAccountedFor, unexploredRegionJobs, takeRegionJob };
export type { RegionJob };
