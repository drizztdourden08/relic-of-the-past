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

/**
 * Canonical identity of a screen-to-screen crossing, the SAME from either side.
 *
 * An edge is always a run of tiles down one side, so a right edge spanning rows
 * 12-25 and the left edge spanning rows 12-25 on the screen to its right are one
 * physical boundary. Matching on that — the pair of screens, the axis, and the span
 * — lets a crossing be recognised from the far side, which an arrival key cannot
 * do: each side derives its own `edgeSig` from its own flood, so the two never
 * compare equal.
 *
 * Region qualifiers are stripped for the pair: which quadrant each side happened to
 * land in says nothing about which boundary was crossed.
 */
const crossingKey = (from: string, to: string, edgeSig?: string): string | null => {
  const parts = /^(north|south|east|west):(.+)$/.exec(edgeSig ?? '');
  if (!parts) return null;
  const axis = parts[1] === 'north' || parts[1] === 'south' ? 'ns' : 'ew';
  const bare = (id: string): string => id.replace(/@\d+,\d+/, '');
  const [a, b] = bare(from) < bare(to) ? [bare(from), bare(to)] : [bare(to), bare(from)];
  return `${a}|${b}|${axis}|${parts[2]}`;
};

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
  crossings?: Set<string>,
  from?: string,
): boolean => {
  if (arrivals.has(arrivalKey(exit.to, exit.edgeSig))) return true;
  // Already crossed this boundary from the other side — same tiles, same result.
  if (crossings && from) {
    const key = crossingKey(from, exit.to, exit.edgeSig);
    if (key && crossings.has(key)) return true;
  }
  return regionCovered(map, exit.to, exit.entryTile);
};

/** How far a way-out's launch tile may sit from the tile we landed on and still
 *  be the same doorway. A door's trigger tile is a few tiles off the spawn it
 *  puts you on, and a border crossing's launch tile sits right on the seam. */
const SAME_DOORWAY_RADIUS = 6;

/**
 * Crossing a link uses it up from BOTH ends.
 *
 * Walking A -> B leaves B's way back to A unaccounted for, so it reads as
 * unexplored ground and schedules a job to return through it. From A the same
 * thing happens in reverse, and the run ping-pongs across one doorway forever,
 * one step forward and one back, inflating the step count for no new ground.
 *
 * The far end cannot be named in advance: each side computes its own crossing
 * span from its own flood, so the two signatures do not match. It IS identifiable
 * on arrival — the exit that leads back where we came from, launching from the
 * tile we just landed on, is the door we walked through. Matching on POSITION
 * rather than on the axis matters: two crossings can share a pair of screens and
 * an axis while landing in places that do not connect (the sanctuary ledge), and
 * collapsing those would make one of them permanently unreachable.
 */
const markWayBackUsed = (
  arrivals: Set<string>,
  cameFrom: { screenId: string; tile: GridPos } | null,
  exits: readonly SimExit[],
): void => {
  if (!cameFrom) return;
  for (const exit of exits) {
    if (exit.to !== cameFrom.screenId || !exit.fromTile) continue;
    if (Math.abs(exit.fromTile.row - cameFrom.tile.row) > SAME_DOORWAY_RADIUS) continue;
    if (Math.abs(exit.fromTile.col - cameFrom.tile.col) > SAME_DOORWAY_RADIUS) continue;
    arrivals.add(arrivalKey(exit.to, exit.edgeSig));
  }
};

/** Visited screens some discovered exit enters OUTSIDE their explored region —
 *  multi-region rooms still owe a visit through that specific doorway. */
const unexploredRegionJobs = (
  discovered: Map<string, SimExit[]>,
  map: Map<string, boolean[][]>,
  visited: Set<string>,
  arrivals: Set<string>,
  crossings?: Set<string>,
): RegionJob[] => {
  const out: RegionJob[] = [];
  const seen = new Set<string>();
  for (const [from, exits] of discovered) {
    for (const exit of exits) {
      if (!visited.has(exit.to) || !exit.entryTile) continue;
      if (arrivalAccountedFor(arrivals, map, exit, crossings, from)) continue;
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

export { unionReach, stampReach, regionCovered, crossingKey, arrivalKey, arrivalAccountedFor, markWayBackUsed, unexploredRegionJobs, takeRegionJob };
export type { RegionJob };
