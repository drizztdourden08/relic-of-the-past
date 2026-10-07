/* @layer tests @kind test */
/**
 * Two bugs pinned here.
 * 1. The ordering score packs real steps, an out-of-area bias (0x1000) and an
 *    unknown-distance sentinel into one number, and was shown verbatim ("4096
 *    steps"). `steps` must only hold a real distance.
 * 2. The walk BFS ignored ledge hops, so anything only reachable by dropping a
 *    ledge got a flat sentinel and sorted arbitrarily.
 */
import { describe, it, expect } from 'vitest';
import { stepDistances, distanceAt, decodeScore } from '../../apps/web/src/lib/game/simulator/exit-order';

const GRID = 64;
const UNREACHED = 0xffff;

/** All-reachable grid, except an impassable wall row that only a ledge crosses. */
const gridWithWall = (wallRow: number): number[][] =>
  Array.from({ length: GRID }, (_, r) => Array.from({ length: GRID }, () => (r === wallRow ? 0 : 1)));

describe('exit score decoding', () => {
  it('reports a plain walk distance as steps', () => {
    expect(decodeScore(42)).toEqual({ steps: 42 });
  });

  it('strips the out-of-area bias instead of printing 4096', () => {
    expect(decodeScore(0x1000 + 28)).toEqual({ steps: 28, stepsNote: 'other-screen' });
    expect(decodeScore(0x1000)).toEqual({ steps: 0, stepsNote: 'other-screen' });
  });

  it('gives no step count when the distance is unknown', () => {
    expect(decodeScore(999)).toEqual({ stepsNote: 'via-hop' });
    expect(decodeScore(UNREACHED)).toEqual({});
  });

  it('never reports the sentinel as a step count', () => {
    for (const score of [999, 0x1000 + 999, UNREACHED]) {
      expect(decodeScore(score).steps ?? 0).toBeLessThan(999);
    }
  });
});

describe('ledge hops in the walk BFS', () => {
  it('leaves the far side of a wall unreachable with no ledge', () => {
    const dist = stepDistances(gridWithWall(10), { row: 5, col: 5 }, []);
    // Row 20 is past the wall, so only the sentinel pass can mark it.
    expect(dist[20 * GRID + 5]).toBe(999);
  });

  it('sorts everything across a ledge drop after every walk on this side', () => {
    const ledges = [{ startRow: 9, startCol: 5, endRow: 11, endCol: 5 }];
    const dist = stepDistances(gridWithWall(10), { row: 5, col: 5 }, ledges);
    // 4 steps down to row 9 is plain walking, so a plain distance.
    expect(dist[9 * GRID + 5]).toBe(4);
    // The drop is ONE-WAY, so the landing costs more than any walk on the
    // current footing. Otherwise the run drops off with work pending above and,
    // the screen being marked visited, never comes back.
    expect(dist[11 * GRID + 5]).toBeGreaterThan(999);
    expect(dist[20 * GRID + 5]).toBe(dist[11 * GRID + 5] + 9);
  });

  it('treats a ledge as one-way, so the far side cannot walk back up it', () => {
    const ledges = [{ startRow: 9, startCol: 5, endRow: 11, endCol: 5 }];
    // Starting BELOW the wall, the ledge's start is not reachable through it.
    const dist = stepDistances(gridWithWall(10), { row: 20, col: 5 }, ledges);
    expect(dist[9 * GRID + 5]).toBe(999);
  });

  it('ignores ledges pointing outside the grid instead of corrupting distances', () => {
    const ledges = [{ startRow: 9, startCol: 5, endRow: 99, endCol: 5 }];
    expect(() => stepDistances(gridWithWall(10), { row: 5, col: 5 }, ledges)).not.toThrow();
  });
});

describe('distanceAt', () => {
  it('finds the nearest walkable ring when the target tile itself is solid', () => {
    const dist = stepDistances(gridWithWall(10), { row: 5, col: 5 }, []);
    // The wall tile itself is unwalkable; the ±4 ring reaches row 6, one step out.
    expect(distanceAt(dist, { row: 10, col: 5 })).toBe(1);
  });
});
