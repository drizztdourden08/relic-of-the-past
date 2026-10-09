/* @layer bridge-wasm @kind logic */
import type { GridPos, LedgeTraversal } from '@rotp/game-core';
import type { ReachState } from '@rotp/game-core';
import {
  AREA_EXIT_BIAS, GRID, HOP_STEPS, LEDGE_COST, START_RING, STEP_DIRECTIONS, UNREACHED,
} from './exit-order.constants';
import { ledgeHops } from './ledge-hops';

const inGrid = (r: number, c: number): boolean => r >= 0 && r < GRID && c >= 0 && c < GRID;
const isReached = (reachable: ReachState[][], r: number, c: number): boolean => (reachable[r]?.[c] ?? 0) > 0;

const seedStartRing = (dist: Uint16Array, queue: number[], reachable: ReachState[][], start: GridPos): void => {
  for (let dr = -START_RING; dr <= START_RING; dr++) {
    for (let dc = -START_RING; dc <= START_RING; dc++) {
      const r = start.row + dr;
      const c = start.col + dc;
      if (!inGrid(r, c) || !isReached(reachable, r, c)) continue;
      const idx = r * GRID + c;
      if (dist[idx] === UNREACHED) {
        dist[idx] = Math.max(Math.abs(dr), Math.abs(dc));
        queue.push(idx);
      }
    }
  }
};

const walk = (dist: Uint16Array, queue: number[], reachable: ReachState[][], hops: Map<number, number[]>): void => {
  for (let head = 0; head < queue.length; head++) {
    const cur = queue[head];
    const r = Math.floor(cur / GRID);
    const c = cur % GRID;
    for (const [dr, dc] of STEP_DIRECTIONS) {
      const nr = r + dr;
      const nc = c + dc;
      if (!inGrid(nr, nc) || !isReached(reachable, nr, nc)) continue;
      const idx = nr * GRID + nc;
      if (dist[idx] !== UNREACHED) continue;
      dist[idx] = dist[cur] + 1;
      queue.push(idx);
    }
    for (const to of hops.get(cur) ?? []) {
      if (dist[to] !== UNREACHED) continue;
      dist[to] = Math.min(dist[cur] + LEDGE_COST, AREA_EXIT_BIAS - 1);
      queue.push(to);
    }
  }
};

const markHopOnly = (dist: Uint16Array, reachable: ReachState[][]): void => {
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const idx = r * GRID + c;
      if (isReached(reachable, r, c) && dist[idx] === UNREACHED) dist[idx] = HOP_STEPS;
    }
  }
};

const stepDistances = (reachable: ReachState[][], start: GridPos, ledges: readonly LedgeTraversal[] = []): Uint16Array => {
  const dist = new Uint16Array(GRID * GRID).fill(UNREACHED);
  if (!inGrid(start.row, start.col)) return dist;
  const queue: number[] = [start.row * GRID + start.col];
  dist[queue[0]] = 0;
  seedStartRing(dist, queue, reachable, start);
  walk(dist, queue, reachable, ledgeHops(ledges));
  markHopOnly(dist, reachable);
  return dist;
};

export { stepDistances };
